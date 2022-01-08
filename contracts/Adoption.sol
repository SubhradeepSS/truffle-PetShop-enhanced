// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Adoption {
    address[16] public adopters;

    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId < 16);
        adopters[petId] = msg.sender;
        return petId;
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
}