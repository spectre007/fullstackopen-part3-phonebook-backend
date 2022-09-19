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

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response) => {
  const {body} = request
  
  if (!(body.name) || !(body.number)) {
    return response.status(400).json({ error: "content missing" })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

// set error handler as last app.use() and after a route calls
const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
