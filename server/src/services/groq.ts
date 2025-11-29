import Groq from 'groq-sdk'
import { User, Position, MatchSuggestion } from '../types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

interface MatchParams {
  position: Position
  skills: string[]
  candidates: Omit<User, 'password'>[]
  isLeaderLooking: boolean // true = leader looking for members, false = member looking for leaders
}

export async function getMatchSuggestions(params: MatchParams): Promise<MatchSuggestion[]> {
  const { position, skills, candidates, isLeaderLooking } = params

  if (candidates.length === 0) {
    return []
  }

  const prompt = `You are a team matching AI for a hackathon. Score each candidate from 0-100 based on skill match.

${isLeaderLooking ? 'A team leader is looking for members' : 'A member is looking for teams/leaders'}.

Required Position: ${position}
Required Skills: ${skills.join(', ')}

Candidates:
${candidates.map((c, i) => `${i + 1}. Name: ${c.name}, Position: ${c.position}, Skills: ${c.skills.join(', ')}`).join('\n')}

Score based on:
1. Position match (must match for high score)
2. Skill overlap (more matching skills = higher score)
3. Complementary skills (bonus for useful related skills)

Return ONLY a valid JSON array, no other text:
[{"userId": "id", "score": 85, "matchedSkills": ["skill1", "skill2"], "reason": "Brief reason"}]

Use the actual user IDs from this list:
${candidates.map(c => `- ${c.name}: ${c.id}`).join('\n')}`

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1024
    })

    const content = completion.choices[0]?.message?.content || '[]'
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', content)
      return fallbackScoring(params)
    }

    const suggestions = JSON.parse(jsonMatch[0]) as Array<{
      userId: string
      score: number
      matchedSkills: string[]
      reason: string
    }>

    // Attach user data to suggestions
    return suggestions
      .map(s => {
        const user = candidates.find(c => c.id === s.userId)
        if (!user) return null
        return {
          ...s,
          user
        }
      })
      .filter((s): s is MatchSuggestion => s !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 suggestions
  } catch (error) {
    console.error('Groq API error:', error)
    return fallbackScoring(params)
  }
}

// Fallback scoring without AI
function fallbackScoring(params: MatchParams): MatchSuggestion[] {
  const { position, skills, candidates } = params

  return candidates
    .map(candidate => {
      let score = 0
      const matchedSkills: string[] = []

      // Position match: +50 points
      if (candidate.position === position) {
        score += 50
      }

      // Skill overlap: up to +50 points
      const requiredSkillsLower = skills.map(s => s.toLowerCase())
      const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase())

      candidateSkillsLower.forEach(skill => {
        if (requiredSkillsLower.some(req => req.includes(skill) || skill.includes(req))) {
          score += Math.min(10, 50 / skills.length)
          matchedSkills.push(candidate.skills[candidateSkillsLower.indexOf(skill)])
        }
      })

      return {
        userId: candidate.id,
        user: candidate,
        score: Math.round(score),
        matchedSkills,
        reason: `Position: ${candidate.position === position ? 'Match' : 'Different'}. Skills: ${matchedSkills.length}/${skills.length} match.`
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

