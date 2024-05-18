// Copyright 2024 Charles Theall Jr
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import express from "express"

const PORT = process.env.PORT
const app = express()

// eslint-disable-next-line no-unused-vars
app.get("/", (req, res, next) => {
    res.send(`<h1>Node/Express E-commerce REST API</h1>
    <p>This API server is not yet implemented.</p>`)
})

const server = app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})

// Handle graceful shutdown of server
const handleShutdown = (sig) => {
    console.log(`${sig} signal received.`)
    server.close(() => {
        console.log("Closed remaining connections.")
        // Additional cleanup goes here (e.g. close Database connections, etc.).
        process.exitCode = 0
    })
}

process.on("SIGINT", handleShutdown)
process.on("SIGTERM", handleShutdown)
