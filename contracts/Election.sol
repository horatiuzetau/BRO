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
    //
    uint maxVoters = 15;
    uint countVoters = 0;
    //
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

        deadline = block.timestamp + 240;
    }

    function isVotingOpen() public view returns (bool){
        if(deadline == 0 || deadline == 1 || block.timestamp > deadline)
            return false;
        return true;
    }

    function getDeadline() public view returns (uint256){
        return deadline;
    }

    function getBlockStamp() public view returns (uint256){
        return block.timestamp;
    }
    
    function votedAlready(address addr) public view returns (Voter memory){
        return voters[addr];
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
        //
        else{
            countVoters ++; //am numarat cati au votat, indiferent daca si-au schimbat votul
        }
        //
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
    
    function showNoVoters() public view returns (uint){ //cati au votat pana acum, asta poate vedea doar admin-ul
    
        require(msg.sender == chairperson, 'You do not have the right to initiate this action!');
        require(deadline != 0,'The voting process has not started yet!');
        return countVoters;
    }
    
    function stopVoting() public {
        require(msg.sender == chairperson, 'You do not have the right to initiate this action!');
        require(deadline != 0,'The voting process has not started yet, so you can not stop it!');
        deadline = 1;    
    }

    function adviserElection() public view returns(string memory){ //putem opri votul cand stim ca au votat mai mult de jumate din candidati, si toate voturile le are exclusiv cineva
        require(msg.sender == chairperson, 'You do not have the right to initiate this action!');
        bool say = false;
        require(deadline != 0,'The voting process has not started yet!');
        require(countVoters >= (maxVoters/2 + 1),'Half of the candidates have not yet voted, I can not advise you');
        uint maxVotes = options[0].noVotes;
        for (uint i = 1; i < options.length; i++ ){ //are warning din cauza break-ului
            if(options[i].noVotes > maxVotes)
                maxVotes = options[i].noVotes;
                if(maxVotes >= (maxVoters/2 + 1))
                        say = true;
                        break; //iesim, nu mai are rost sa votam
        }
        if(maxVotes >= (maxVoters/2 +1))
            say = true;
        if(say == true)
            return "The Election can end, we have already a winner";
        else
            return "If you stop the election right now, it will not be a fair voting";
        
    }
    
    function modifyCandidateName(uint candidate,string memory newName)public{
        require(msg.sender == chairperson, 'You do not have the right to initiate this action!');
        require(deadline == 0  ,'The voting has started or ended, you can not modify the candidates');
        require(candidate < options.length, 'Invalid option, give me a valid number!');
        options[candidate].name = newName;
    }
    
}