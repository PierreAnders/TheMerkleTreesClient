// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EncryptionKeyManager {
    mapping(address => bytes32) public encryptionKeys;

    event KeyGenerated(address indexed user, bytes32 key);

    function generateKey() public {
        require(encryptionKeys[msg.sender] == 0, "Key already generated");
        bytes32 newKey = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        encryptionKeys[msg.sender] = newKey;
        emit KeyGenerated(msg.sender, newKey);
    }

    function getKey() public view returns (bytes32) {
        require(encryptionKeys[msg.sender] != 0, "No key generated");
        return encryptionKeys[msg.sender];
    }
}
