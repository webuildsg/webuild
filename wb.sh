#!/bin/sh

app="~/Workspace/webuild"

open $app
subl $app

open https://github.com/webuildsg/webuild/issues?q=is%3Aopen
open http://localhost:4000
open https://webuild.sg
open https://webuildsg-dev.herokuapp.com/
open /Applications/GitX.app

tmuxinator wb
