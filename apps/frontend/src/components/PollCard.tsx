"use client"

interface PollOption {
  id: number
  text: string
  vote_count: number
  voted: boolean
}

interface Poll {
  id: number
  title: string
  creator_name: string
  created_at: string
  end_time: string
  has_voted: boolean
  options: PollOption[]
}

interface PollCardProps {
  poll: Poll
  onVote: (pollId: number, optionId: number) => void
}

export default function PollCard({ poll, onVote }: PollCardProps) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.vote_count, 0)
  const isExpired = new Date(poll.end_time) < new Date()

  const getOptionPercentage = (voteCount: number) => {
    return totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex-1">{poll.title}</h3>
          {poll.has_voted && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full ml-2">✓ Voted</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
          <span>By {poll.creator_name}</span>
          <span>Ends: {new Date(poll.end_time).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = getOptionPercentage(option.vote_count)
            const isVoted = option.voted

            return (
              <div key={option.id} className="relative">
                <div
                  className={`relative overflow-hidden rounded-md border transition-all duration-200 ${
                    isVoted
                      ? "border-green-400 bg-green-50"
                      : poll.has_voted || isExpired
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!poll.has_voted && !isExpired) {
                      onVote(poll.id, option.id)
                    }
                  }}
                >
                  {/* Progress bar background */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isVoted ? "bg-green-200" : "bg-blue-200"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isVoted && <span className="text-green-600">✓</span>}
                      <span className={`font-medium ${isVoted ? "text-green-700" : "text-gray-700"}`}>
                        {option.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">{option.vote_count} votes</span>
                      {totalVotes > 0 && <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Total votes: {totalVotes}</span>
            {isExpired && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">Expired</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
