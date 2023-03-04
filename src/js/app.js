App = {
  
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function () {
    // Load products.
    await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: async function () {
    // Initialize the smart contract.
    // Get the current account and set it as the default account for transactions
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      App.account = accounts[0];
    });

    const response = await fetch('SupplyChain.json');
    $.getJSON('SupplyChain.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SupplyChainArtifact = data;
      App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);

      // Set the provider for our contract
      App.contracts.SupplyChain.setProvider(App.web3Provider);
      // 
      return App.getProductList();
    });


    return App.bindEvents();
  },

  bindEvents: function () {
    // Bind events to UI elements.
    $('#product-manufacturer').val(App.account);
    $('#product-location').val(App.account);
    $(document).on('click', '#create-product-btn', App.handleCreateProduct);
    $(document).on('click', '#fetch-products-btn', App.getProductList);
    $(document).on('click', '#acquire-products-btn', App.buyProduct);
    $(document).on('click', '#my-inventory', App.getOwnProductList);
    $(document).on('click', '#my-events', App.getPastEvents);
    $(document).on('click', '#get-product-info', App.getPastEvents);
    $(document).on('click', '.location-cell', function () {
      var location = $(this).data('location');
      $('#location-text').text(location);
      $('#location-modal').show();
    })
    $(document).on('click', '.close', function () {
      $('#location-modal').hide();
    })
    $(document).on('click', 'table th:nth-child(6)', function () {
      if($('table th:nth-child(6)').attr('mode') == 'cresc') {
        $('table th:nth-child(6)').html('Date <i class="fa-sharp fa-solid fa-caret-down"></i>')
        $('table th:nth-child(6)').attr('mode','decresc')
      } else {
        $('table th:nth-child(6)').html('Date <i class="fa-sharp fa-solid fa-caret-up"></i>')
        $('table th:nth-child(6)').attr('mode','cresc')
      }
      var table = $(this).parents('table').eq(0)
      var rows = table.find('tr:gt(0)').toArray().sort(App.comparer($(this).index()))
      this.asc = !this.asc
      if (!this.asc) {
        rows = rows.reverse()
      }
      for (var i = 0; i < rows.length; i++) {
        table.append(rows[i])
      }
    })
    window.ethereum.on('accountsChanged', function (accounts) {
      location.reload();
    });
    window.ethereum.on('networkChanged', function (networkId) {
      location.reload();
    });
  },

  handleCreateProduct: function (event) {
    event.preventDefault();

    // Get the product details from the UI.
    const name = $('#product-name').val();
    const price = web3.toWei(parseFloat($('#product-price').val()), 'ether');
    // Create the product on the blockchain.
    
    App.contracts.SupplyChain.deployed().then(function (instance) {
      SupplyChainInstance = instance;

      return SupplyChainInstance.createProduct(name, price, { from: App.account });
    }).then(function (result) {
      $('#sellProduct').modal('toggle');
      return App.getProductList();
    }).catch(function (err) {
      console.log(err.message);
    });
    
  },

  getPastEvents: async function (event) {
    var productId = parseInt($(event.target).attr('index'));
    var table =  `
        <div class="container w-100">
          <div class="row justify-content-center">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0" >
                      <thead>
                        <tr>
                          <th scope="col">Event</th>
                          <th scope="col">Unit Price</th>
                          <th scope="col">Unit Status</th>
                          <th scope="col" class="w-25">From</th>
                          <th scope="col" class="w-25">To</th>
                          <th scope="col" style="cursor: pointer;" mode="cresc">Date <i class="fa-sharp fa-solid fa-caret-down"></i></th>
                        </tr>
                      </thead>
                      <tbody id="events-list">
                        
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    $('#product-list').html(table);
    var eventList = [];
    
    try {
      const SupplyChainInstance = await App.contracts.SupplyChain.deployed();
      const events = await SupplyChainInstance.allEvents({ fromBlock: 0, toBlock: 'latest'});
      events.watch(function(error, result){
        if (!error)
          if(parseInt(result.args.productId) == productId){
            if(result.event == "ProductCreated"){
              $('#header').html(result.args.name);
              $('#sub-header').html('Created by: ' + String(result.args.manufacturer));
              eventList.push(`
              <tr>
                <th scope="row">${result.event}</th>
                <td class="justify-content-center">${web3.fromWei(result.args.price, 'ether')} ETH</td>
                <td class="justify-content-center"><div class="badge bg-success text-white">On Sale</div></td>
                <td class="location-cell" data-location="${result.args.manufacturer}">${result.args.manufacturer.slice(0, -27) + '...'}</td>
                <td class="location-cell" data-location="${result.args.currentLocation}">${result.args.currentLocation.slice(0, -27) + '...'}</td>
                <td>${App.convertUnixTimestamp(result.args.timestamp)}</td>
              </tr>
              `)
            } 
            if(result.event == "ProductSold"){
              eventList.push(`
              <tr>
                <th scope="row">${result.event}</th>
                <td class="justify-content-center">${web3.fromWei(result.args.price, 'ether')} ETH</td>
                <td class="justify-content-center"><div class="badge bg-danger text-white">Not on Sale</div></td>
                <td class="location-cell" data-location="${result.args.owner}">${result.args.owner.slice(0, -27) + '...'}</td>
                <td class="location-cell" data-location="${result.args.buyer}">${result.args.buyer.slice(0, -27) + '...'}</td>
                <td>${App.convertUnixTimestamp(result.args.timestamp)}</td>
              </tr>
              `)
            } 
            if(result.event == "ProductChanged"){
              if (result.args.newStatus) {
                var sale = 'Not on Sale'
                var bg_color = 'bg-danger'
              } else {
                var sale = 'On Sale'
                var bg_color = 'bg-success'
              }
              eventList.push(`
              <tr>
                <th scope="row">${result.event}</th>
                <td class="justify-content-center">${web3.fromWei(result.args.newPrice, 'ether')} ETH</td>
                <td class="justify-content-center"><div class="badge ${bg_color} text-white">${sale}</div></td>
                <td>-</td>
                <td>-</td>
                <td>${App.convertUnixTimestamp(result.args.timestamp)}</td>
              </tr>
              `)
            } 
          }
          $('#events-list').html(eventList.join(""));
      });
    } catch (error) {
      console.error('Error getting events:', error);
    }
  },

  buyProduct: function (event) {
    event.preventDefault()
    var SupplyChainInstance;

    const productId = parseInt($(event.target).attr('index'));
    const productPrice = parseInt($(event.target).attr('price'));
    console.log(productId, productPrice)

    App.contracts.SupplyChain.deployed().then(function (instance) {
      SupplyChainInstance = instance;

      return SupplyChainInstance.acquireProduct(productId, { value: productPrice, from: App.account })
    }).then(function (result) {
      console.log(result);
      App.getProductList();
    }).catch(function (err) {
      console.log(err.message);
    })

  },

  saveButton: function (event) {
    event.preventDefault()
    console.log($(event.target))
    var SupplyChainInstance;

    const productId = parseInt($(event.target).attr('index'));
    const productPrice = parseInt($(event.target).attr('price'));
    const status = $(event.target).attr('status') == "true" ? true : false
    console.log(productId, productPrice, status)

    App.contracts.SupplyChain.deployed().then(function (instance) {
      SupplyChainInstance = instance;

      return SupplyChainInstance.changeProductAttr(productId, productPrice, status, {from: App.account })
    }).then(function (result) {
      console.log(result);
      App.getProductList();
    }).catch(function (err) {
      console.log(err.message);
    })
  },

  getProductList: async function () {
    var SupplyChainInstance = await App.contracts.SupplyChain.deployed();
    var productList = '';
    var productCount = await SupplyChainInstance.getProductCount();
  
    async function getProduct(index) {
      if (index >= productCount) {
        // all products have been retrieved, update the UI
        $('#product-list').html(productList);
        return;
      }
      try {
        SupplyChainInstance = await App.contracts.SupplyChain.deployed();
        var product = await SupplyChainInstance.getProduct(index + 1);
  
        // create HTML for the product
        // ...
        if (product[4]) {
          var sale = 'Already Sold'
          var bg_color = 'bg-danger'
        } else {
          var sale = 'On Sale'
          var bg_color = 'bg-success'
        }
        if (App.account == product[2]) {
          var canBuy = 'disabled'
          var message = 'Complimenti è già tuo!'
        } else {
          if (product[4]) {
            var canBuy = 'disabled'
            var message = 'Non puoi acquistarlo!'
          } else {
            var canBuy = 'enabled'
            var message = 'Puoi acquistarlo!'
          }

        }
        productList += `
          <div class="col mb-5">
              <div class="card h-100">
                  <!-- Sale badge-->
                  <div class="badge ${bg_color} text-white position-absolute" style="top: 0.5rem; right: 0.5rem">${sale}</div>
                  <!-- Product image-->
                  <img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
                  <!-- Product details-->
                  <div class="card-body p-1">
                      <div class="text-justify">
                          <!-- Product name-->
                          <h5 class="display-5">${product[0]}</h5>
                          <!-- Product price-->
                          <h1 class="card-title pricing-card-title display-6 text-center">
                            ${web3.fromWei(product[3], 'ether')}
                            <small class="text-dark" font-size="12pt">ETH</small>
                          </h1>
                          <!-- Location info-->
                          <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-wrapping">Created by:</span>
                            <input type="text" class="form-control" placeholder="${product[1]}" value="${product[1]}" aria-label="${product[1]}" aria-describedby="addon-wrapping" disabled>
                          </div>
                          <br>
                          <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-wrapping">Owned by:</span>
                            <input type="text" class="form-control" placeholder="${product[2]}" value="${product[2]}" aria-label="${product[2]}" aria-describedby="addon-wrapping" disabled>
                          </div>
                      </div>
                  </div>
                  <br>
                  <!-- Product actions-->
                  <div class="alert alert-primary d-flex align-items-center w-75 mx-auto" role="alert">
                    <i class="fa-solid fa-circle-info px-2"></i>
                    <div>
                     ${message}
                    </div>
                  </div>
                  <div class="card-footer p-4 pt-0 border-top-0 bg-transparent d-flex justify-content-center">
                    <div class="d-grid gap-2 d-md-block">
                      <button id="get-product-info" type="button" class="btn btn-primary" style="width: 100px" index="${index + 1}">Info</button>
                      <button id="acquire-products-btn" type="button" class="btn btn-outline-dark" style="width: 100px" 
                      index="${index + 1}" price="${product[3]}" ${canBuy}>Buy</button>
                    </div>
                  </div>
              </div>
          </div>`;
  
        // get the next product
        await getProduct(index + 1);
      } catch (error) {
        console.log(error.message);
      }
    }
  
    // start retrieving the products
    await getProduct(0);
  },

  getOwnProductList: async function () {
    var SupplyChainInstance = await App.contracts.SupplyChain.deployed();
    var productList = '';
    var productCount = await SupplyChainInstance.getProductCount();
    var alert = `<div class="alert alert-info alert-dismissible fade show" role="alert">
                  <i class="fa-regular fa-circle-info"></i>
                  <strong>Welcome to your inventory!</strong> Click on the product badge to change its status, use the +/- to change the price.
                  <strong>Don't forget to save!</strong>
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
    $('#main-alert').html(alert)
    $('#header').html('My Inventory');
    $('#sub-header').html('Address:' + App.account);

    async function getProduct(index) {
      if (index >= productCount) {
        // all products have been retrieved, update the UI
        $('#product-list').html(productList);
        return;
      }
      try {
        SupplyChainInstance = await App.contracts.SupplyChain.deployed();
        var product = await SupplyChainInstance.getProduct(index + 1);
  
        if (product[4]) {
          var sale = 'Not on Sale';
          var bg_color = 'bg-danger';
        } else {
          var sale = 'On Sale';
          var bg_color = 'bg-success';
        }
        if (App.account == product[2]) {
          $(document).on('click', '#status-badge-' + index, App.changeBadgeStatus);
          $(document).on('click', '#btn-minus-' + index, App.priceDown);
          $(document).on('click', '#btn-plus-' + index, App.priceUp);
          $(document).on('click', '#save-products-btn-' + index, App.saveButton);

          productList += `
          <div class="col mb-5">
              <div class="card h-100">
                  <!-- Sale badge-->
                  <div id="status-badge-${index}" value="${index}" class="badge ${bg_color} text-white position-absolute" style="top: 0.5rem; right: 0.5rem; cursor: pointer;">${sale}</div>
                  <!-- Product image-->
                  <img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
                  <!-- Product details-->
                  <div class="card-body p-1">
                      <div class="text-justify">
                          <!-- Product name-->
                          <h5 class="display-5">${product[0]}</h5>
                          <!-- Product price-->
                          <div class="btn-group float-end">
                            <button id="btn-minus-${index}" value="${index}" type="button" class="btn btn-default">
                              <i class="fa-solid fa-minus"></i>
                            </button>
                            <button id="btn-plus-${index}" value="${index}" type="button" class="btn btn-default">
                              <i class="fa-solid fa-plus"></i>
                            </button>
                          </div>
                            
                          <h1 class="card-title pricing-card-title display-6 text-center">
                            <span id="price-${index}">${web3.fromWei(product[3], 'ether')}</span>
                            <small class="text-dark" font-size="12pt">ETH</small>
                          </h1>
                          <!-- Location info-->
                          <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-wrapping">Created by:</span>
                            <input type="text" class="form-control" placeholder="${product[1]}" value="${product[1]}" aria-label="${product[1]}" aria-describedby="addon-wrapping" disabled>
                          </div>
                          <br>
                          <div class="input-group flex-nowrap">
                            <span class="input-group-text" id="addon-wrapping">Owned by:</span>
                            <input type="text" class="form-control" placeholder="${product[2]}" value="${product[2]}" aria-label="${product[2]}" aria-describedby="addon-wrapping" disabled>
                          </div>
                      </div>
                  </div>
                  <br>
                  <!-- Product actions-->
                  <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                      <div class="text-center">
                      <button id="save-products-btn-${index}" type="button" class="btn btn-outline-dark" style="width: 100px" status="${product[4]}" index="${index + 1}" price="${product[3]}">Save</button></div>
                  </div>
              </div>
          </div>`;
        }
        // get the next product
        await getProduct(index + 1);
      } catch (error) {
        console.log(error.message);
      }
    }
  
    // start retrieving the products
    await getProduct(0);
  },

  changeBadgeStatus: function (event) {
    event.preventDefault();
    if ($(event.target).hasClass("bg-danger")) {
      $(event.target).removeClass("bg-danger");
      $(event.target).addClass("bg-success");
      $(event.target).html("On Sale");
      $('#save-products-btn-' + $(event.target).attr('value')).attr('status', false);
    } else {
      $(event.target).removeClass("bg-success");
      $(event.target).addClass("bg-danger");
      $(event.target).html("Not on Sale");
      $('#save-products-btn-' + $(event.target).attr('value')).attr('status', true);
    }
  },

  priceUp: function(event) {
    var newPrice = parseInt($('#save-products-btn-' + $(event.target).parent().attr('value')).attr('price')) + parseInt(10000000000000000);
    console.log(newPrice)

    $('#save-products-btn-' + $(event.target).parent().attr('value')).attr('price', newPrice);
    $('#price-'+ $(event.target).parent().attr('value')).html(web3.fromWei(newPrice, 'ether'));
  },

  priceDown: function(event) {
    var newPrice = parseInt($('#save-products-btn-' + $(event.target).parent().attr('value')).attr('price')) -  parseInt(10000000000000000);
    console.log(newPrice)
    if(newPrice > 0) {
      $('#save-products-btn-' + $(event.target).parent().attr('value')).attr('price', newPrice);
      $('#price-'+ $(event.target).parent().attr('value')).html(web3.fromWei(newPrice, 'ether'));
    }
  },

  convertUnixTimestamp: function(unixTimeStamp) {
    const date = new Date(unixTimeStamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    const formattedDate = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    return formattedDate;
  },

  comparer: function (index) {
    return function(a, b) {
      var valA = App.getCellValue(a, index)
      var valB = App.getCellValue(b, index)
      return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
    }
  },

  getCellValue: function (row, index) {
    return $(row).children('td').eq(index).text()
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});