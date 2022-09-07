const { request, response } = require("express");
const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(express.json())
app.use(morgan("tiny"))

const randomInt = (imax=1000) => Math.floor(Math.random() * imax)

const generateId = (existingIds) => {
  let id = 1
  while (existingIds.includes(id)) {
    id = randomInt()
  }
  return id
}

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>` +
      `<div> ${new Date()} </div>`
  )
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((p) => p.id === id)
  if (person) {
      response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((p) => p.id !== id)
  response.status(204).end()
})

app.post("/api/persons", (request, response) => {
  const newPerson = request.body
  const existingIds = persons.map((p) => Number(p.id))
  const existingNames = persons.map((p) => p.name)
  newPerson.id = generateId(existingIds)
  
  // error handling
  if (!(newPerson.name)) {
    response.status(400).json({
      error: "person must have name"
    }).end()
  } else if (!(newPerson.number)) {
    response.status(400).json({
      error: "person must have number"
    }).end()
  } else if (existingNames.includes(newPerson.name)) {
    response.status(400).json({
      error: "name must be unique"
    }).end()
  } else {
    console.log(`Adding ${newPerson.name} with ID=${newPerson.id}`)
    persons = persons.concat(newPerson)
    response.json(newPerson)  
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
