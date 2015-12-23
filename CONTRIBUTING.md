# Contributing

> Please, take into account that TaskFlex is governed by the Talos Digital's
[Project Governance policy](https://github.com/talosdigital/docs), to see how
you can manage your contribution and what to consider when contributing to this
project check the [Collaborator Guide](https://github.com/talosdigital/docs).

Thanks for your interest in TaskFlex! You can contribute in many ways.
Here are some of them:

## Reporting bugs and issues
Head over to [this repository's issues page]
(https://github.com/talosdigital/TaskFlex/issues), and open a new one!
It's very helpful if you specify as much as you can about the environment you're
working on, and the steps to reproduce the issue!

## Submitting a pull request
- Fork the repository and create a feature branch for your contribution.
- Run `rspec` in `backend` folder and `gulp test` in `frontend` one to check
that all tests pass, prior to modifying anything.
- Write tests for the code you write, and check the code coverage report in
`frontend/coverage/<your browser>/index.html`, generated when you run
`gulp test` and make sure you tested everything.
- If applicable, document your changes in the [README](README.md). Use markdown
to keep a neat style. [Dillinger](http://dillinger.io/) is a nice editor, check
it out!
- Submit a pull request!
