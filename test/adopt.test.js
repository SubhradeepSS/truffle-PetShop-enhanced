const Adoption = artifacts.require('Adoption');

contract("Adoption", accounts => {
    describe("Testing Adoption contract", () => {
        it("Test adopt function", async () => {
            const adoptionInstance = await Adoption.deployed()
            const petId = 7

            await adoptionInstance.adopt(petId, {from: accounts[0]})
            const adopters = await adoptionInstance.getAdopters()

            assert(adopters[petId], accounts[0])

        })
        
        
        it("Test unAdopt function", async () => {
            const adoptionInstance = await Adoption.deployed()
            const petId = 7

            const adopters = await adoptionInstance.getAdopters()

            await adoptionInstance.unAdopt(petId)
            assert(adopters[petId], '0x0000000000000000000000000000000000000000')
        })
        
        
        it("Test isPetAdopted function", async () => {
            const adoptionInstance = await Adoption.deployed()
            const petId = 7

            await adoptionInstance.adopt(petId, {from: accounts[0]})
            const isPetAdopted = await adoptionInstance.isPetAdopted(petId)

            assert(isPetAdopted, true)

        })

    })
})