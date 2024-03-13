# ft_transcendence || Pong Multiplayer Online Game

This repository contains the code for a real-time multiplayer online Pong game. The project is part of a school assignment for [Codam](https://www.codam.nl/en/)/[42 Network](https://www.42network.org/) and is built using NestJS for the backend, Svelte for the frontend, and PostgreSQL for the database.

## Project Overview

The main purpose of this website is to allow users to play Pong versus other players directly on the website. It includes a user-friendly interface, a chat system, and real-time multiplayer online games.

## Tech Stack

- **Backend**: NestJS
- **Frontend**: Svelte (a TypeScript framework)
- **Database**: PostgreSQL

## Features

- **User Account**: Users can log in using the OAuth system of 42 intranet, choose a unique name, upload an avatar, enable two-factor authentication, add other users as friends, and see their current status. User stats and match history are displayed on the user profile.
- **Chat**: Users can create public or private chat rooms, send direct messages to other users, block other users, and invite other users to play a Pong game through the chat interface.
- **Game**: Users can play a live Pong game versus another player directly on the website. The game includes a matchmaking system and offers some customization options.

## Compatibility

The website is a single-page application compatible with the latest stable up-to-date version of Google Chrome and one additional web browser of your choice. It can be launched by a single call to: `docker-compose up --build`.

## Security

Passwords stored in the database are hashed, and the website is protected against SQL injections. Server-side validation is implemented for forms and any user input.
