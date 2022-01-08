const Adoption = artifacts.require('Adoption');

contract("Adoption", accounts => {
    describe("Testing Adoption contract", () => {
        it("Test adopt function", async () => {
            const adoptionInstance = await Adoption.deployed()
            const petId = 7

            await adoptionInstance.adopt(petId, { from: accounts[0] })
            const adopters = await adoptionInstance.getAdopters()

            assert(adopters[petId] === accounts[0])
        })


        it("Test unAdopt function", async () => {
            const adoptionInstance = await Adoption.deployed()
            const petId = 7

            await adoptionInstance.unAdopt(petId, { from: accounts[0] })
            const adopters = await adoptionInstance.getAdopters()

            assert(adopters[petId] === '0x0000000000000000000000000000000000000000')
        })


        it("Test isPetAdopted function", async () => {
            const adoptionInstance = await Adoption.deployed()
            const petId = 7

            await adoptionInstance.adopt(petId, { from: accounts[0] })
            const isPetAdopted = await adoptionInstance.isPetAdopted(petId)

            assert(isPetAdopted)
        })


        it("Test signupUser function", async () => {
            const adoptionInstance = await Adoption.deployed()

            const userAddr = accounts[0]
            const password = 100

            const userSignupRes = await adoptionInstance.signupUser(userAddr, password, { from: userAddr })

            assert(userSignupRes)
        })


        it("Test getUserPassword function", async () => {
            const adoptionInstance = await Adoption.deployed()

            const userAddr = accounts[0]
            const password = 100

            await adoptionInstance.signupUser(userAddr, password, { from: userAddr })
            const userPassword = await adoptionInstance.getUserPassword(userAddr)

            assert(parseInt(userPassword) === password)
        })


        it("Test checkLoginCredentials function", async () => {
            const adoptionInstance = await Adoption.deployed()

            const userAddr = accounts[0]
            const password = 100
            const inCorrectPassword = 1000

            await adoptionInstance.signupUser(userAddr, password, { from: userAddr })
            const userExists = await adoptionInstance.checkLoginCredentials(userAddr, inCorrectPassword, { from: userAddr })

            assert(!userExists)
        })
    })
})