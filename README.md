<div id="readme-top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GNU General Public License v2.0][license-shield]][license-url]

<h1 align="center">HubGrub</h1>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>    
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project
<div style="text-align: justify"> 
This is a decentralized application (Dapp) that provides a platform for sellers to sell their products in a secure and transparent manner. The Dapp is built on the Ethereum blockchain using the Solidity programming language and Ganache, a local blockchain network for testing purposes. The front-end of the application is built using Node.js.

The key features of this Dapp include:

Secure transactions between buyers and sellers using smart contracts.
Tracking of product ownership and changes in price through the blockchain.
Seamless and trustworthy transaction process for sellers and buyers.
</div>

### Built With

* [![Ethereum]][Ethereum-link] 
* [![Solidity]][Solidity-link] 
* [![NodeJS]][NodeJS-link]

## Getting started

### Prerequisites

What you will need:
- node.js >= 19.8.1
- ganache >= 2.7.0
- metamask

### Installation
To install and run the Dapp on your local machine, follow these steps:

Clone this repository to your local machine using the command:

	git clone https://github.com/MattiaLimone/HubGrub.git

Install the necessary dependencies by running the command:
 
	npm install
 
Start Ganache by running the command:
 
	ganache-cli
 
Compile and deploy the smart contracts to the local blockchain by running the command:
 
	truffle migrate
 

Start the Dapp by running the command:
 
	npm start
 

Open your web browser and navigate to the following URL:
http://localhost:3000

## Usage
Once the Dapp is running, sellers can create a new product by providing the required information (name, image, price). 
Once the product is created, it will be added to the blockchain and can be viewed by buyers. 
Buyers can purchase the product by sending the required amount of Ether to the seller's wallet address. 
The transaction will be recorded on the blockchain, and the ownership of the product will be transferred to the buyer.
Owners can decide to change product price and sale status. It's also possible to see all the events regarding a specific product

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Mattia Limone [[Linkedin profile](https://www.linkedin.com/in/mattia-limone/)]

Alessia Natake [[Linkedin Profile](https://www.linkedin.com/in/alessianatale/)]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/MattiaLimone/HuggingGreen.svg?style=for-the-badge
[contributors-url]: https://github.com/MattiaLimone/HuggingGreen/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MattiaLimone/HuggingGreen.svg?style=for-the-badge
[forks-url]: https://github.com/MattiaLimone/HuggingGreen/network/members
[stars-shield]: https://img.shields.io/github/stars/MattiaLimone/HuggingGreen.svg?style=for-the-badge
[stars-url]: https://github.com/MattiaLimone/HuggingGreen/stargazers
[issues-shield]: https://img.shields.io/github/issues/MattiaLimone/HuggingGreen.svg?style=for-the-badge
[issues-url]: https://github.com/MattiaLimone/HuggingGreen/issues
[license-shield]: https://img.shields.io/github/license/MattiaLimone/HuggingGreen.svg?style=for-the-badge
[license-url]: https://github.com/MattiaLimone/HuggingGreen/blob/main/LICENSE
[TensorFlow]: https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white
[Keras]: https://img.shields.io/badge/Keras-%23D00000.svg?style=for-the-badge&logo=Keras&logoColor=white
[NumPy]: https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white
[Pandas]: https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white
[Matplotlib]: https://img.shields.io/badge/Matplotlib-%23ffffff.svg?style=for-the-badge&logo=Matplotlib&logoColor=black
[PyTorch]: https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white
[scikit-learn]: https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white
[SciPy]: https://img.shields.io/badge/SciPy-%230C55A5.svg?style=for-the-badge&logo=scipy&logoColor=%white
[NodeJS]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[NodeJS-link]: https://nodejs.org/en
[Ethereum]: https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white
[Ethereum-link]: https://ethereum.org/
[Solidity]: https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white
[Solidity-link]: https://soliditylang.org/
