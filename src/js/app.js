App = {
  web3Provider: null,
  contracts: {},

  init: async () => {
    await App.initWeb3();
    
    $('#logout').click(() => {
      localStorage.removeItem('user')
      location.reload()
    })

    const user = localStorage.getItem('user')

    $('form').submit(event => App.handleLogin(event))

    $('#signUpBtn').click(event => App.handleSignUp(event))

    if (user !== null) {
      $('#loginDiv').hide()
      $('#logout').show()
      $('#rewardH3').show()
      await App.loadPets()
    }

  },

  handleLogin: async (event) => {
    event.preventDefault();

    let adoptionInstance;
    const web3Address = $('#web3Address').val().toLowerCase()
    const password = $('#password').val()

    App.contracts.Adoption.deployed().then(instance => {
      adoptionInstance = instance;
      return adoptionInstance.checkLoginCredentials.call(web3Address, parseInt(password));

    }).then(userExists => {
      if (userExists) {
        localStorage.setItem('user', web3Address)

        $('#loginDiv').hide()
        $('#logout').show()
        $('#rewardH3').show()
        App.loadPets()
      }
      else {
        alert('Incorrect credentials')
      }

      $('#web3Address').val('')
      $('#password').val('')

    }).catch(err => {
      console.log(err.message);
    });
  },

  handleSignUp: (event) => {
    event.preventDefault();

    let adoptionInstance;
    const web3Address = $('#web3Address').val().toLowerCase()
    const password = $('#password').val()

    App.contracts.Adoption.deployed().then(instance => {
      adoptionInstance = instance;
      return adoptionInstance.signupUser(web3Address, parseInt(password), { from: web3Address });

    }).then(signUpSuccess => {
      if (signUpSuccess) {
        alert('Signup Successfull')
      }
      else {
        alert('This address is already in use')
      }

      $('#web3Address').val('')
      $('#password').val('')

    }).catch(err => {
      console.log(err.message);
    });
  },

  loadPets: () => {
    $.getJSON('../pets.json', data => {
      let petsRow = $('#petsRow');
      let petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-reward').text(data[i].reward);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-adopt').attr('data-reward', data[i].reward);

        petsRow.append(petTemplate.html());
      }

      App.markAdopted();
      $(document).on('click', '.btn-adopt', App.handleAdopt);

    });
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


    return await App.initContract();
  },

  initContract: () => {
    $.getJSON('Adoption.json', AdoptionArtifact => {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

    });
  },

  markAdopted: () => {
    let adoptionInstance;

    const account = localStorage.getItem('user')

    App.contracts.Adoption.deployed().then(instance => {
      adoptionInstance = instance;
      return adoptionInstance.getBalance.call(account);

    }).then(balance => {
      
      $('#rewards').html(parseInt(balance))
      return adoptionInstance.getAdopters.call();

    }).then(adopters => {
      for (i = 0; i < adopters.length; i++) {
        let adoptText = $('.panel-pet').eq(i).find('button')

        if (adopters[i] === '0x0000000000000000000000000000000000000000') {
          adoptText.text('Adopt');
        }

        else if (adopters[i] === account) {
          adoptText.text('UnAdopt');
        }

        else {
          adoptText.text('Already adopted').attr('disabled', true);
        }
      }
    }).catch(err => {
      console.log(err.message);
    });

  },

  handleAdopt: event => {
    event.preventDefault();

    const petId = parseInt($(event.target).data('id'))
    const petReward = parseInt($(event.target).data('reward'))
    let adoptionInstance;

    const account = localStorage.getItem('user');

    App.contracts.Adoption.deployed().then(instance => {
      adoptionInstance = instance;
      return adoptionInstance.isPetAdopted.call(petId);

    }).then(isPetAdopted => {
      if (!isPetAdopted) {
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, petReward, { from: account });
      }
      return adoptionInstance.unAdopt(petId, petReward, { from: account });

    }).then(() => {
      return App.markAdopted();
    }).catch(err => {
      console.log(err.message);
    });

  }

};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
