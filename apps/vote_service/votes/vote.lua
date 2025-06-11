-- local voters, tally, voter, opt = KEYS[1], KEYS[2], ARGV[1], ARGV[2]

-- redis.call("HINCRBY", tally, opt, 1)
-- redis.call("SADD", voters, voter)
-- return 1

local voters, tally, voter, opt = KEYS[1], KEYS[2], ARGV[1], ARGV[2]

-- Check if the voter has already voted
if redis.call("SISMEMBER", voters, voter) == 0 then
  -- Voter hasn't voted yet: count the vote and record the voter
  redis.call("HINCRBY", tally, opt, 1)
  redis.call("SADD", voters, voter)
  return 1
end

-- Voter has already voted
return 0