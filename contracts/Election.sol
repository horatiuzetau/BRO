pragma solidity >=0.4.21 <0.7.0;

pragma experimental ABIEncoderV2;

contract Election {
    struct Voter {
        bool voted;
        uint optionId;
    }
    
    struct Option {
        string name;
        uint noVotes;
    }
    
    address chairperson;
    mapping(address => Voter) voters;
    Option[] options;
    uint256 deadline = 0;
    
    constructor (string[] memory optionNames) public {
        chairperson = msg.sender;
        for (uint i = 0; i < optionNames.length; i++) {
            options.push(
                Option({
                    name: optionNames[i],
                    noVotes: 0
                }));
        }
    }
    
    function startVoting(uint secTillDeadLine) public {
        require(msg.sender == chairperson, 'You do not have the right to initiate this action!');
        deadline = block.timestamp + secTillDeadLine;
    }
    
    function vote(uint option) public {
        require(block.timestamp <= deadline, 'You are not able to vote!');
        require(option < options.length, 'Invallid option!');
        address voter = msg.sender;
        if (voters[voter].voted == true) {
            options[voters[voter].optionId].noVotes--;
        }
        voters[voter].voted = true;
        voters[voter].optionId = option;
        options[option].noVotes++;
    }
    
    function viewOptions() public view returns (string[] memory) {
        string[] memory _options = new string[](options.length);
        for (uint i = 0; i < options.length; i++) {
            _options[i] = options[i].name;
        }
        return _options;
    }
    
    function viewResults() public view returns (string memory, uint, uint) {
        require(deadline > 0 && block.timestamp > deadline, 'The voting process has not ended yet!');
        uint maxNoVotes = options[0].noVotes;
        uint noVoters = maxNoVotes;
        uint winnerId = 0;
        for (uint i = 1; i < options.length; i++) {
            if (options[i].noVotes > maxNoVotes) {
                maxNoVotes = options[i].noVotes;
                winnerId = i;
            }
            noVoters += options[i].noVotes;
        }
        return (options[winnerId].name, noVoters, maxNoVotes);
    }
}