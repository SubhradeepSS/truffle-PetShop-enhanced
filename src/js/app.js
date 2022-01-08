App = {
  web3Provider: null,
  contracts: {},

  init: async () => {
    // Load pets.
    $.getJSON('../pets.json', data => {
      let petsRow = $('#petsRow');
      let petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
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
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: () => {
    $.getJSON('Adoption.json', AdoptionArtifact => {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });


    return App.bindEvents();
  },

  bindEvents: () => {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: () => {
    let adoptionInstance;

    App.contracts.Adoption.deployed().then(instance => {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(adopters => {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('UnAdopt');
        }
        else {
          $('.panel-pet').eq(i).find('button').text('Adopt');
        }
      }
    }).catch(err => {
      console.log(err.message);
    });

  },

  handleAdopt: event => {
    event.preventDefault();

    const petId = parseInt($(event.target).data('id'))
    let adoptionInstance;

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      const account = accounts[0];

      App.contracts.Adoption.deployed().then(instance => {
        adoptionInstance = instance;
        return adoptionInstance.isPetAdopted.call(petId);

      }).then(isPetAdopted => {
        if (!isPetAdopted) {
          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, { from: account });
        }
        return adoptionInstance.unAdopt(petId, { from: account });

      }).then(() => {
        return App.markAdopted();
      }).catch(err => {
        console.log(err.message);
      });
    });

  }

};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
