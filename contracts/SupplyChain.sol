// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {

    struct Product {
        string name; // Nome del prodotto
        address manufacturer; // Indirizzo del produttore
        address currentLocation; // Indirizzo del proprietario attuale
        uint256 price; // Prezzo del prodotto
        bool isSold; // Flag che indica se il prodotto è in vendita
    }

    // Mappatura che tiene traccia dei prodotti in base al loro ID
    mapping (uint => Product) public products;

    // Contatore dei prodotti presenti nel contratto
    uint public productCount;

    // Dichiarazione degli eventi emessi dal contratto
    event ProductCreated(uint productId, string name, address manufacturer, address currentLocation, uint256 price, uint256 timestamp);
    event ProductChanged(uint productId, uint256 newPrice, bool newStatus, uint256 timestamp);
    event ProductSold(uint productId, address owner, address buyer, uint256 price, uint256 timestamp);
    
    // Funzione per la creazione di un nuovo prodotto
    function createProduct(string memory _name, uint256 _price) public {
        // Incrementa il contatore dei prodotti
        productCount++;

        // Aggiunge il nuovo prodotto alla mappatura dei prodotti
        products[productCount] = Product(_name, msg.sender, msg.sender, _price, false);

        // Emette l'evento ProductCreated per segnalare la creazione del nuovo prodotto
        emit ProductCreated(productCount, _name, msg.sender, msg.sender, _price, block.timestamp);
    }

    // Funzione per ottenere il numero totale di prodotti presenti nel contratto
    function getProductCount() public view returns (uint) {
        return productCount;
    }
    
    // Funzione per ottenere le informazioni relative a un determinato prodotto
    function getProduct(uint productId) public view returns (string memory, address , address ,  uint256 , bool ) {
        return (products[productId].name, products[productId].manufacturer, products[productId].currentLocation,
            products[productId].price,products[productId].isSold);
    }

    // Funzione per acquistare un prodotto
    function acquireProduct(uint _productId) payable public {
        // Verifica se il prodotto è già stato venduto
        require(products[_productId].isSold == false, "Prodotto non in vendita");
        // Verifica se l'acquirente non è anche il venditore
        require(products[_productId].currentLocation != msg.sender, "Non puoi acquistare un prodotto posseduto");
        // Verifica se la quantità di Ether inviata è uguale al prezzo del prodotto
        require(msg.value == products[_productId].price, "Incorrect amount of Ether sent");

        // Effettua il trasferimento di Ether dal compratore al venditore
        (bool sent, ) = payable(products[_productId].currentLocation).call{value: msg.value}("");

        // Controllo che il trasferimento sia avvenuto con successo
        require(sent, "Failed to send Ether");

        // Tengo traccia del precedente proprietario per l'evento
        address oldOwner = products[_productId].currentLocation;
        // Aggiorna lo stato del prodotto
        products[_productId].isSold = true;
        // Aggiorna il proprietario del prodotto
        products[_productId].currentLocation = msg.sender;

        // Emetto l'evento ProductSold per segnalare l'acquisto del prodotto
        emit ProductSold(_productId, oldOwner, msg.sender, msg.value, block.timestamp);
    }

    // Funzione per cambiare stato e prezzo di un prodotto
    function changeProductAttr(uint _productId, uint256 _newPrice, bool _newStatus) public {
        // Verifica se chi richiama la funzione è il proprietario del prodotto
        require(products[_productId].currentLocation == msg.sender, "Non sei il proprietario del prodotto");
        // Aggiorna il prezzo del prodotto
        products[_productId].price = _newPrice;
        // Aggiorna lo stato del prodotto
        products[_productId].isSold = _newStatus;
        // Emette l'evento ProductChanged per segnalare che il prodotto è stato modificato
        emit ProductChanged(_productId, _newPrice, _newStatus, block.timestamp);
    }

}
