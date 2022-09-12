require("dotenv").config()
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person")


// utility functions
const randomInt = (imax=1000) => Math.floor(Math.random() * imax)

const generateId = (existingIds) => {
  let id = 1
  while (existingIds.includes(id)) {
    id = randomInt()
  }
  return id
}

// morgan logger
const allButPOST = (req, res) => req.method !== "POST"
const onlyPOST = (req, res) => req.method === "POST"

morgan.token("person", (req) => {
    const {name, number} = req.body
    return JSON.stringify({name, number})
})
morgan.token("tinyWithPerson",
    ":method :url :status :res[content-length] - :response-time ms :person"
)

// app & middleware
const app = express();
app.use(express.json())
app.use(express.static("build"))
app.use(cors())
app.use(morgan("tinyWithPerson", {skip: allButPOST}))
app.use(morgan("tiny", {skip: onlyPOST}))

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
  Person.find({}).then(persons => {
    response.json(persons)
  })
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
    persons = persons.concat(newPerson)
    response.json(newPerson)  
  }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
