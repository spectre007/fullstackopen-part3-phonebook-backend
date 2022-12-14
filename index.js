require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")


// morgan logger
const allButPOST = (req) => req.method !== "POST"
const onlyPOST = (req) => req.method === "POST"

morgan.token("person", (req) => {
  const { name, number } = req.body
  return JSON.stringify({ name, number })
})
morgan.token("tinyWithPerson",
  ":method :url :status :res[content-length] - :response-time ms :person"
)

// app & middleware
const app = express()
app.use(express.json())
app.use(express.static("build"))
app.use(cors())
app.use(morgan("tinyWithPerson", { skip: allButPOST }))
app.use(morgan("tiny", { skip: onlyPOST }))


app.get("/info", (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>` +
        `<div> ${new Date()} </div>`
      )
    })
    .catch(error => next(error))
})

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
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
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const { body } = request

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const { body } = request

  Person.findByIdAndUpdate(request.params.id, { number: body.number }, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// handle unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

// set error handler as last app.use() and after a route calls
const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  } else if (error.name === "MongoServerError") {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
