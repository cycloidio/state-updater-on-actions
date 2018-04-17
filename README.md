# State Updater on Actions

**THIS JS LIBRARY IS HEAVILY UNDER DEVELOPMENT**

Small JS module which allow to call asynchronous actions which are required to "transmit" a state which is shared by all the actions and required by the system which execute the action and returns the result.

The most clear example is a HTTP API service which require to send an updated authorization token on each request (the actions), but it response with special response when the token is valid but must be updated for allowing such operation.

## License

The MIT License (MIT)
Copyright (c) 2018 cycloid.io
Read the LICENSE file for more information.


