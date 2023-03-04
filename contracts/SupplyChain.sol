// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
/*
This contract defines a Product struct that contains information about the product, including its name, manufacturer, and current location. 
It also includes a boolean flag that indicates whether the product has been sold.

The SupplyChain contract includes a mapping that allows you to store multiple products, as well as a productCount variable that keeps track 
of the number of products in the mapping.

The contract includes four functions for updating the supply chain: createProduct, shipProduct, receiveProduct, and sellProduct. The 
createProduct function allows you to create a new product and add it to the mapping. The other three functions allow you to update the 
current location of a product as it moves through the supply chain.

The contract also includes four events (ProductCreated, ProductShipped, ProductReceived, and ProductSold) that can be emitted whenever a 
product is created or its status is updated. These events can be used to notify users of changes to the supply chain.
*/
contract SupplyChain {

    struct Product {
        string name;
        address manufacturer;
        address currentLocation;
        uint256 price;
        bool isSold;
    }

    mapping (uint => Product) public products;
    uint public productCount;

    event ProductCreated(uint productId, string name, address manufacturer, address currentLocation, uint256 price, uint256 timestamp);
    event ProductChanged(uint productId, uint256 newPrice, bool newStatus, uint256 timestamp);
    event ProductSold(uint productId, address owner, address buyer, uint256 price, uint256 timestamp);
    
    function createProduct(string memory _name, uint256 _price) public {
        productCount++;

        products[productCount] = Product(_name, msg.sender, msg.sender, _price, false);
        emit ProductCreated(productCount, _name, msg.sender, msg.sender, _price, block.timestamp);
    }

    function getProductCount() public view returns (uint) {
        return productCount;
    }
    
    function getProduct(uint productId) public view returns (string memory, address , address ,  uint256 , bool ) {
        return (products[productId].name, products[productId].manufacturer, products[productId].currentLocation,
            products[productId].price,products[productId].isSold);
    }

    function acquireProduct(uint _productId) payable public {
        require(products[_productId].isSold == false, "Product is already sold");
        require(products[_productId].currentLocation != msg.sender, "You cannot acquire your own product");
        require(msg.value == products[_productId].price, "Incorrect amount of Ether sent");

        (bool sent, ) = payable(products[_productId].currentLocation).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        products[_productId].isSold = true;
        address owner = products[_productId].currentLocation;
        products[_productId].currentLocation = msg.sender;

        emit ProductSold(_productId, owner, msg.sender, msg.value, block.timestamp);
    }

    function changeProductAttr(uint _productId, uint256 _newPrice, bool _newStatus) public {
        require(products[_productId].currentLocation == msg.sender, "You cannot change the product price as you are not the current location");

        products[_productId].price = _newPrice;
        products[_productId].isSold = _newStatus;
        emit ProductChanged(_productId, _newPrice, _newStatus, block.timestamp);
    }

}
