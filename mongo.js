const mongoose = require("mongoose")

// extract from command line arguments
const hasAddOption = process.argv.length > 3
const [password, name, number, ...rest] = process.argv.slice(2)

const url = `mongodb+srv://fullstack:${password}@pitaja.ozzbjha.mongodb.net/personApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const collectionName = "people"
const Person = mongoose.model("Person", personSchema, collectionName)


const findAllPeople = () => {
  return Person
    .find({})
    .then(result => {
      console.log("phonebook:")
      result.forEach(person => console.log(`${person.name} ${person.number}`))
    })
}

const savePerson = ({name, number}) => {
  const person = new Person({
    name,
    number,
  })
  return person.save()
}

mongoose
  .connect(url)
  .then(() => {
    console.log("connected")

    if (hasAddOption) {
      return savePerson({name, number})
    } else {
      return findAllPeople()
    }
  })
  .then((addedPerson) => {
    if (addedPerson) {
      console.log(`added ${name} number ${number} to phonebook`)
    }
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))

