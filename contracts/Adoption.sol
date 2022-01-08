// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Adoption {
    address[16] public adopters;
    mapping(address => uint) public users;

    function adopt(uint petId) public {
        require(petId >= 0 && petId < 16);
        adopters[petId] = msg.sender;
    }

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    function unAdopt(uint petId) public {
        require(petId >= 0 && petId < 16);
        adopters[petId] = address(0);
    }

    function isPetAdopted(uint petId) public view returns (bool) {
        require(petId >= 0 && petId < 16);
        return adopters[petId] != address(0);
    }

    function checkUserExists(address addr) public view returns (bool) {
        return users[addr] != 0;   
    }

    function signupUser(address addr, uint password) public returns (bool) {
        if(checkUserExists(addr)) {
            return false;
        }
        users[addr] = password;
        return true;
    }

    function getUserPassword(address addr) public view returns (uint) {
        return users[addr];
    }

    function checkLoginCredentials(address addr, uint inputPassword) public view returns (bool) {
        return (checkUserExists(addr) && getUserPassword(addr) == inputPassword);
    }
    
}