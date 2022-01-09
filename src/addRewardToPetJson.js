// adding a key: reward to every pet obj using this script

const fs = require('fs');
let data = fs.readFileSync('./pets.json', {encoding:'utf8', flag:'r'})
data = JSON.parse(data)

let newData = []

data.forEach(pet => {
    const reward = Math.floor(Math.random() * 5) + 1
    newData.push({
        ...pet,
        reward
    })
})

fs.writeFileSync('./pets.json', JSON.stringify(newData), 'utf8')
