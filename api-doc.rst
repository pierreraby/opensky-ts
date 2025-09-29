.. rest-api_:

OpenSky REST API
================

The root URL of our REST API is::

    https://opensky-network.org/api

There are several functions available to retrieve :ref:`state vectors <state-vectors>`, flights and tracks for the whole network, a particular sensor, or a particular aircraft. Note that the functions to retrieve state vectors of sensors other than your own are rate limited (see :ref:`limitations`).

.. _all-states:

All State Vectors
-----------------

The following API call can be used to retrieve any state vector of the OpenSky. Please note that rate limits apply for this call (see :ref:`limitations`). For API calls without rate limitation, see :ref:`own-states`.

Operation
^^^^^^^^^

:code:`GET /states/all`

Request
^^^^^^^

You can (optionally) request state vectors for particular airplanes or times using the following request parameters:

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *time*         | integer   | The time in seconds since epoch (Unix time     |
|                |           | stamp to retrieve states for. Current time     |
|                |           | will be used if omitted.                       |
+----------------+-----------+------------------------------------------------+
| *icao24*       | string    | One or more ICAO24 transponder addresses       |
|                |           | represented by a hex string (e.g. `abc9f3`).   |
|                |           | To filter multiple ICAO24 append the property  |
|                |           | once for each address. If omitted, the state   |
|                |           | vectors of all aircraft are returned.          |
+----------------+-----------+------------------------------------------------+

In addition to that, it is possible to query a certain area defined by a bounding box of WGS84 coordinates.
For this purpose, add all of the following parameters:

+----------------+-----------+---------------------------------------------------+
| Property       | Type      | Description                                       |
+================+===========+===================================================+
| *lamin*        | float     | lower bound for the latitude in decimal degrees   |
+----------------+-----------+---------------------------------------------------+
| *lomin*        | float     | lower bound for the longitude in decimal degrees  |
+----------------+-----------+---------------------------------------------------+
| *lamax*        | float     | upper bound for the latitude in decimal degrees   |
+----------------+-----------+---------------------------------------------------+
| *lomax*        | float     | upper bound for the longitude in decimal degrees  |
+----------------+-----------+---------------------------------------------------+

Lastly, you can request the category of aircraft by adding the following request parameter:

+----------------+-----------+--------------------------------------------------------------+
| Property       | Type      | Description                                                  |
+================+===========+==============================================================+
| *extended*     | integer   | Set to 1 if required                                         |
+----------------+-----------+--------------------------------------------------------------+

Example query with time and aircraft: :code:`https://opensky-network.org/api/states/all?time=1458564121&icao24=3c6444`


Example query with bounding box covering Switzerland: :code:`https://opensky-network.org/api/states/all?lamin=45.8389&lomin=5.9962&lamax=47.8229&lomax=10.5226`

Response
^^^^^^^^^
The response is a JSON object with the following properties

+----------------+-----------+------------------------------------------------------------------------+
| Property       | Type      | Description                                                            |
+================+===========+========================================================================+
| *time*         | integer   | The time which the state vectors in this response are associated with. |
|                |           | All vectors represent the state of a vehicle with the interval         |
|                |           | :math:`[time - 1, time]`.                                              |
+----------------+-----------+------------------------------------------------------------------------+
| *states*       | array     | The state vectors.                                                     |
+----------------+-----------+------------------------------------------------------------------------+

The *states* property is a two-dimensional array. Each row represents a :ref:`state vector <state-vectors>`
and contains the following fields:

+-------+-------------------+---------+------------------------------------------------------------------+
| Index | Property          | Type    | Description                                                      |
+=======+===================+=========+==================================================================+
| 0     | *icao24*          | string  | Unique ICAO 24-bit address of the transponder in hex string      |
|       |                   |         | representation.                                                  |
+-------+-------------------+---------+------------------------------------------------------------------+
| 1     | *callsign*        | string  | Callsign of the vehicle (8 chars). Can be null if no callsign    |
|       |                   |         | has been received.                                               |
+-------+-------------------+---------+------------------------------------------------------------------+
| 2     | *origin_country*  | string  | Country name inferred from the ICAO 24-bit address.              |
+-------+-------------------+---------+------------------------------------------------------------------+
| 3     | *time_position*   | int     | Unix timestamp (seconds) for the last position update. Can be    |
|       |                   |         | null if no position report was received by OpenSky within the    |
|       |                   |         | past 15s.                                                        |
+-------+-------------------+---------+------------------------------------------------------------------+
| 4     | *last_contact*    | int     | Unix timestamp (seconds) for the last update in general. This    |
|       |                   |         | field is updated for any new, valid message received from the    |
|       |                   |         | transponder.                                                     |
+-------+-------------------+---------+------------------------------------------------------------------+
| 5     | *longitude*       | float   | WGS-84 longitude in decimal degrees. Can be null.                |
+-------+-------------------+---------+------------------------------------------------------------------+
| 6     | *latitude*        | float   | WGS-84 latitude in decimal degrees. Can be null.                 |
+-------+-------------------+---------+------------------------------------------------------------------+
| 7     | *baro_altitude*   | float   | Barometric altitude in meters. Can be null.                      |
+-------+-------------------+---------+------------------------------------------------------------------+
| 8     | *on_ground*       | boolean | Boolean value which indicates if the position was retrieved from |
|       |                   |         | a surface position report.                                       |
+-------+-------------------+---------+------------------------------------------------------------------+
| 9     | *velocity*        | float   | Velocity over ground in m/s. Can be null.                        |
+-------+-------------------+---------+------------------------------------------------------------------+
| 10    | *true_track*      | float   | True track in decimal degrees clockwise from north (north=0°).   |
|       |                   |         | Can be null.                                                     |
+-------+-------------------+---------+------------------------------------------------------------------+
| 11    | *vertical_rate*   | float   | Vertical rate in m/s. A positive value indicates that the        |
|       |                   |         | airplane is climbing, a negative value indicates that it         |
|       |                   |         | descends. Can be null.                                           |
+-------+-------------------+---------+------------------------------------------------------------------+
| 12    | *sensors*         | int[]   | IDs of the receivers which contributed to this state vector.     |
|       |                   |         | Is null if no filtering for sensor was used in the request.      |
+-------+-------------------+---------+------------------------------------------------------------------+
| 13    | *geo_altitude*    | float   | Geometric altitude in meters. Can be null.                       |
+-------+-------------------+---------+------------------------------------------------------------------+
| 14    | *squawk*          | string  | The transponder code aka Squawk. Can be null.                    |
+-------+-------------------+---------+------------------------------------------------------------------+
| 15    | *spi*             | boolean | Whether flight status indicates special purpose indicator.       |
+-------+-------------------+---------+------------------------------------------------------------------+
| 16    | *position_source* | int     | Origin of this state's position.                                 |
|       |                   |         |                                                                  |
|       |                   |         | * 0 = ADS-B                                                      |
|       |                   |         | * 1 = ASTERIX                                                    |
|       |                   |         | * 2 = MLAT                                                       |
|       |                   |         | * 3 = FLARM                                                      |
+-------+-------------------+---------+------------------------------------------------------------------+
| 17    | *category*        | int     | Aircraft category.                                               |
|       |                   |         |                                                                  |
|       |                   |         | * 0 = No information at all                                      |
|       |                   |         | * 1 = No ADS-B Emitter Category Information                      |
|       |                   |         | * 2 = Light (< 15500 lbs)                                        |
|       |                   |         | * 3 = Small (15500 to 75000 lbs)                                 |
|       |                   |         | * 4 = Large (75000 to 300000 lbs)                                |
|       |                   |         | * 5 = High Vortex Large (aircraft such as B-757)                 |
|       |                   |         | * 6 = Heavy (> 300000 lbs)                                       |
|       |                   |         | * 7 = High Performance (> 5g acceleration and 400 kts)           |
|       |                   |         | * 8 = Rotorcraft                                                 |
|       |                   |         | * 9 = Glider / sailplane                                         |
|       |                   |         | * 10 = Lighter-than-air                                          |
|       |                   |         | * 11 = Parachutist / Skydiver                                    |
|       |                   |         | * 12 = Ultralight / hang-glider / paraglider                     |
|       |                   |         | * 13 = Reserved                                                  |
|       |                   |         | * 14 = Unmanned Aerial Vehicle                                   |
|       |                   |         | * 15 = Space / Trans-atmospheric vehicle                         |
|       |                   |         | * 16 = Surface Vehicle – Emergency Vehicle                       |
|       |                   |         | * 17 = Surface Vehicle – Service Vehicle                         |
|       |                   |         | * 18 = Point Obstacle (includes tethered balloons)               |
|       |                   |         | * 19 = Cluster Obstacle                                          |
|       |                   |         | * 20 = Line Obstacle                                             |
+-------+-------------------+---------+------------------------------------------------------------------+


.. _limitations:

Limitations
^^^^^^^^^^^

Limitiations for anonymous (unauthenticated) users
""""""""""""""""""""""""""""""""""""""""""""""""""

Anonymous are those users who access the API without using credentials. The limitations for anonymous users are:

* Anonymous users can only get the most recent state vectors, i.e. the `time` parameter will be ignored.
* Anonymous users can only retrieve data with a time resolution of 10 seconds. That means, the API will return state vectors for time :math:`now - (now\ mod\ 10)`.
* Anonymous users get 400 API credits per day (see credit usage below).

Limitations for OpenSky users
"""""""""""""""""""""""""""""

.. note:: IMPORTANT: Legacy accounts can continue using the API as before; however, basic authentication using your username and password is being deprecated and will only be supported for a limited time. Accounts created on the new website since mid-March 2025 do not have additional privileges and will receive an Unauthorized response. If you have a new account, follow the instructions in the section below on using the OAuth2 client credentials flow.

An OpenSky user is anybody who uses a valid OpenSky account or corresponding API client to access the API. The rate limitations for OpenSky users are:

* OpenSky users clients can retrieve data of up to 1 hour in the past. If the `time` parameter has a value :math:`t<now-3600` the API will return `400 Bad Request`.
* OpenSky users can retrieve data with a time resolution of 5 seconds. That means, if the *time* parameter was set to :math:`t`, the API will return state vectors for time :math:`t - (t\ mod\ 5)`.
* OpenSky users get 4000 API credits per day. This is also true for the default privileges when using the API client. For higher request loads please contact OpenSky.
* Active contributing OpenSky users get a total of 8000 API credits per day. An active user is a user which has an ADS-B receiver that is at least 30% online (measured over the current month).

.. note:: If you are feeding and using the API client it will take 50+ requests before your credit allowance is increased to 8000. This new credit allowance is dynamic and not tied to any role so you will still see the default role with 4000 credits in the API client info. To verirfy you are getting 8000 credits inspect the x-rate-limit-remaining response header. If at times (like the start of the day) it is greater than 4000 then you will be getting the 8000 credit allowance. This is exactly the same as how things work with basic authentication.

.. note::
    You can retrieve all state vectors received by your receivers without any restrictions. See :ref:`own-states`. Before the request limit is reached the header `X-Rate-Limit-Remaining` indicates the amount of remaining credits. After the rate limit is reached the status code `429 - Too Many Requests` is returned and the header `X-Rate-Limit-Retry-After-Seconds` indicates how many seconds until credits/request become available again.

    This is currently not working for the API client and is in the process of being fixed.



OAuth2 Client Credentials Flow
"""""""""""""""""""""""""""""""

To authenticate using a modern and secure method, OpenSky now supports the OAuth2 *client credentials* flow. This is required for all accounts created since mid-March 2025 and is recommended for all programmatic access to the API.

To get started:

1. Log in to your OpenSky account and visit the `Account <https://opensky-network.org/my-opensky/account>`_ page.
2. Create a new API client and retrieve your ``client_id`` and ``client_secret``.
3. Use these credentials to obtain an access token from the OpenSky authentication server.

Here is an example using ``curl`` to obtain an access token:

.. code-block:: bash

   export CLIENT_ID=your_client_id
   export CLIENT_SECRET=your_client_secret

   export TOKEN=$(curl -X POST "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials" \
     -d "client_id=$CLIENT_ID" \
     -d "client_secret=$CLIENT_SECRET" | jq -r .access_token)

Once you have an access token, include it in the ``Authorization`` header of your API requests:

.. code-block:: bash

   curl -H "Authorization: Bearer $TOKEN" https://opensky-network.org/api/states/all | jq .

.. note:: IMPORTANT: When using the API client replace -u "USERNAME:PASSWORD" with -H "Authorization: Bearer $TOKEN in all following example requests.

The token will expire after 30 minutes. You can repeat the above request to obtain a new token as needed. If a request returns a ``401 Unauthorized`` response, it likely means the token has expired or is invalid.

``/states/all`` and other authenticated endpoints require this token-based authentication for non-legacy accounts using your API client.

API credit usage
""""""""""""""""

API credits are now used for all endpoints except /states/own. Credit usage is lower in general for restricted/smaller areas (/states/all) and shorter time frames (/flights and /tracks). For /states/all the credit calculation is done by square degrees. The area can be restricted by using the *lamin, lamax, lomin, lomax* query parameters. The *area square deg* column in the table below indicates the square degree limit - e.g. a box extending over latitude 10 degress and longitude 5 degrees, would equal 50 square degrees:

+----------------+-----------+-----------------------------------------------------------+
| Area square deg| Credits   | Example                                                   |
+================+===========+===========================================================+
| *0 - 25*       | 1         | /api/states/all?lamin=49.7&lamax=50.5&lomin=3.2&lomax=4.6 |
| (<500x500km)   |           |                                                           |
+----------------+-----------+-----------------------------------------------------------+
| *25 - 100*     | 2         | /api/states/all?lamin=46.5&lamax=49.9&lomin=-1.4&lomax=6.8|
| (<1000x1000km) |           |                                                           |
+----------------+-----------+-----------------------------------------------------------+
| *100 - 400*    | 3         |/api/states/all?lamin=42.2&lamax=49.8&lomin=-4.7&lomax=10.9|
| (<2000x2000km) |           |                                                           |
+----------------+-----------+-----------------------------------------------------------+
| *over 400*     | 4         | /api/states/all                                           |
| or all         |           |                                                           |
| (>2000x2000km) |           |                                                           |
+----------------+-----------+-----------------------------------------------------------+

For /flights and /tracks the credit usage is calculated by partitions used by the query, which corresponds roughly to number of days queried.

Examples
^^^^^^^^^

Retrieve all states as an anonymous user:

.. code-block:: bash

    $ curl -s "https://opensky-network.org/api/states/all" | python -m json.tool


Retrieve all states as an authenticated OpenSky user:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/states/all" | python -m json.tool

Retrieve states of two particular airplanes:

.. code-block:: bash

    $ curl -s "https://opensky-network.org/api/states/all?icao24=3c6444&icao24=3e1bf9" | python -m json.tool

----

.. _own-states:

Own State Vectors
-----------------

The following API call can be used to retrieve state vectors for your own sensors without rate limitations.
Note that authentication is required for this operation, otherwise you will get a `403 - Forbidden`.

Operation
^^^^^^^^^

:code:`GET /states/own`

Request
^^^^^^^

Pass one of the following (optional) properties as request parameters to the `GET` request.

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *time*         | integer   | The time in seconds since epoch (Unix          |
|                |           | timestamp to retrieve states for. Current time |
|                |           | will be used if omitted.                       |
+----------------+-----------+------------------------------------------------+
| *icao24*       | string    | One or more ICAO24 transponder addresses       |
|                |           | represented by a hex string (e.g. `abc9f3`).   |
|                |           | To filter multiple ICAO24 append the property  |
|                |           | once for each address. If omitted, the state   |
|                |           | vectors of all aircraft are returned.          |
+----------------+-----------+------------------------------------------------+
| *serials*      | integer   | Retrieve only states of a subset of your       |
|                |           | receivers. You can pass this argument several  |
|                |           | time to filter state of more than one of your  |
|                |           | receivers. In this case, the API returns all   |
|                |           | states of aircraft that are visible to at      |
|                |           | least one of the given receivers.              |
+----------------+-----------+------------------------------------------------+


Response
^^^^^^^^

The response is a JSON object with the following properties

+----------------+-----------+------------------------------------------------------------------------+
| Property       | Type      | Description                                                            |
+================+===========+========================================================================+
| *time*         | integer   | The time which the state vectors in this response are associated with. |
|                |           | All vectors represent the state of a vehicle with the interval         |
|                |           | :math:`[time - 1, time]`.                                              |
+----------------+-----------+------------------------------------------------------------------------+
| *states*       | array     | The state vectors.                                                     |
+----------------+-----------+------------------------------------------------------------------------+

The *states* property is a two-dimensional array. Each row represents a :ref:`state vector <state-vectors>`
and contains the following fields:

+-------+-------------------+---------+------------------------------------------------------------------+
| Index | Property          | Type    | Description                                                      |
+=======+===================+=========+==================================================================+
| 0     | *icao24*          | string  | Unique ICAO 24-bit address of the transponder in hex string      |
|       |                   |         | representation.                                                  |
+-------+-------------------+---------+------------------------------------------------------------------+
| 1     | *callsign*        | string  | Callsign of the vehicle (8 chars). Can be null if no callsign    |
|       |                   |         | has been received.                                               |
+-------+-------------------+---------+------------------------------------------------------------------+
| 2     | *origin_country*  | string  | Country name inferred from the ICAO 24-bit address.              |
+-------+-------------------+---------+------------------------------------------------------------------+
| 3     | *time_position*   | int     | Unix timestamp (seconds) for the last position update. Can be    |
|       |                   |         | null if no position report was received by OpenSky within the    |
|       |                   |         | past 15s.                                                        |
+-------+-------------------+---------+------------------------------------------------------------------+
| 4     | *last_contact*    | int     | Unix timestamp (seconds) for the last update in general. This    |
|       |                   |         | field is updated for any new, valid message received from the    |
|       |                   |         | transponder.                                                     |
+-------+-------------------+---------+------------------------------------------------------------------+
| 5     | *longitude*       | float   | WGS-84 longitude in decimal degrees. Can be null.                |
+-------+-------------------+---------+------------------------------------------------------------------+
| 6     | *latitude*        | float   | WGS-84 latitude in decimal degrees. Can be null.                 |
+-------+-------------------+---------+------------------------------------------------------------------+
| 7     | *baro_altitude*   | float   | Barometric altitude in meters. Can be null.                      |
+-------+-------------------+---------+------------------------------------------------------------------+
| 8     | *on_ground*       | boolean | Boolean value which indicates if the position was retrieved from |
|       |                   |         | a surface position report.                                       |
+-------+-------------------+---------+------------------------------------------------------------------+
| 9     | *velocity*        | float   | Velocity over ground in m/s. Can be null.                        |
+-------+-------------------+---------+------------------------------------------------------------------+
| 10    | *true_track*      | float   | True track in decimal degrees clockwise from north (north=0°).   |
|       |                   |         | Can be null.                                                     |
+-------+-------------------+---------+------------------------------------------------------------------+
| 11    | *vertical_rate*   | float   | Vertical rate in m/s. A positive value indicates that the        |
|       |                   |         | airplane is climbing, a negative value indicates that it         |
|       |                   |         | descends. Can be null.                                           |
+-------+-------------------+---------+------------------------------------------------------------------+
| 12    | *sensors*         | int[]   | IDs of the receivers which contributed to this state vector.     |
|       |                   |         | Is null if no filtering for sensor was used in the request.      |
+-------+-------------------+---------+------------------------------------------------------------------+
| 13    | *geo_altitude*    | float   | Geometric altitude in meters. Can be null.                       |
+-------+-------------------+---------+------------------------------------------------------------------+
| 14    | *squawk*          | string  | The transponder code aka Squawk. Can be null.                    |
+-------+-------------------+---------+------------------------------------------------------------------+
| 15    | *spi*             | boolean | Whether flight status indicates special purpose indicator.       |
+-------+-------------------+---------+------------------------------------------------------------------+
| 16    | *position_source* | int     | Origin of this state's position.                                 |
|       |                   |         |                                                                  |
|       |                   |         | * 0 = ADS-B                                                      |
|       |                   |         | * 1 = ASTERIX                                                    |
|       |                   |         | * 2 = MLAT                                                       |
|       |                   |         | * 3 = FLARM                                                      |
+-------+-------------------+---------+------------------------------------------------------------------+
| 17    | *category*        | int     | Aircraft category.                                               |
|       |                   |         |                                                                  |
|       |                   |         | * 0 = No information at all                                      |
|       |                   |         | * 1 = No ADS-B Emitter Category Information                      |
|       |                   |         | * 2 = Light (< 15500 lbs)                                        |
|       |                   |         | * 3 = Small (15500 to 75000 lbs)                                 |
|       |                   |         | * 4 = Large (75000 to 300000 lbs)                                |
|       |                   |         | * 5 = High Vortex Large (aircraft such as B-757)                 |
|       |                   |         | * 6 = Heavy (> 300000 lbs)                                       |
|       |                   |         | * 7 = High Performance (> 5g acceleration and 400 kts)           |
|       |                   |         | * 8 = Rotorcraft                                                 |
|       |                   |         | * 9 = Glider / sailplane                                         |
|       |                   |         | * 10 = Lighter-than-air                                          |
|       |                   |         | * 11 = Parachutist / Skydiver                                    |
|       |                   |         | * 12 = Ultralight / hang-glider / paraglider                     |
|       |                   |         | * 13 = Reserved                                                  |
|       |                   |         | * 14 = Unmanned Aerial Vehicle                                   |
|       |                   |         | * 15 = Space / Trans-atmospheric vehicle                         |
|       |                   |         | * 16 = Surface Vehicle – Emergency Vehicle                       |
|       |                   |         | * 17 = Surface Vehicle – Service Vehicle                         |
|       |                   |         | * 18 = Point Obstacle (includes tethered balloons)               |
|       |                   |         | * 19 = Cluster Obstacle                                          |
|       |                   |         | * 20 = Line Obstacle                                             |
+-------+-------------------+---------+------------------------------------------------------------------+


Examples
^^^^^^^^^

Retrieve states for all sensors that belong to you:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/states/own" | python -m json.tool


Retrieve states as seen by a specific sensor with serial `123456`

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/states/own?serials=123456" | python -m json.tool


Retrieve states for several receivers:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/states/own?serials=123456&serials=98765" | python -m json.tool




.. _flights-all:

Flights in Time Interval
----------------------------

This API call retrieves flights for a certain time interval [begin, end]. If no flights
are found for the given time period, HTTP status `404 - Not found` is returned with an empty
response body.

Operation
^^^^^^^^^

:code:`GET /flights/all`

Request
^^^^^^^

These are the required request parameters:

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *begin*        | integer   | Start of time interval to retrieve flights for |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+
| *end*          | integer   | End of time interval to retrieve flights for   |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+

The given time interval must not be larger than two hours!

Response
^^^^^^^^

The response is a JSON array of flights where each flight is an object with the following properties:

+--------------------------------------------+---------+-----------------------------------------------------+
| Property                                   | Type    | Description                                         |
+============================================+=========+=====================================================+
| *icao24*                                   | string  | Unique ICAO 24-bit address of the transponder in    |
|                                            |         | hex string representation. All letters are lower    |
|                                            |         | case.                                               |
+--------------------------------------------+---------+-----------------------------------------------------+
| *firstSeen*                                | integer | Estimated time of departure for the flight as Unix  |
|                                            |         | time (seconds since epoch).                         |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirport*                      | string  | ICAO code of the estimated departure airport. Can   |
|                                            |         | be null if the airport could not be identified.     |
+--------------------------------------------+---------+-----------------------------------------------------+
| *lastSeen*                                 | integer | Estimated time of arrival for the flight as Unix    |
|                                            |         | time (seconds since epoch)                          |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirport*                        | string  | ICAO code of the estimated arrival airport. Can be  |
|                                            |         | null if the airport could not be identified.        |
+--------------------------------------------+---------+-----------------------------------------------------+
| *callsign*                                 | string  | Callsign of the vehicle (8 chars). Can be null if   |
|                                            |         | no callsign has been received. If the vehicle       |
|                                            |         | transmits multiple callsigns during the flight, we  |
|                                            |         | take the one seen most frequently                   |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportHorizDistance*         | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportVertDistance*          | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportHorizDistance*           | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportVertDistance*            | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *departureAirportCandidatesCount*          | integer | Number of other possible departure airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estDepartureAirport*.                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *arrivalAirportCandidatesCount*            | integer | Number of other possible arrival airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estArrivalAirport*.                                |
+--------------------------------------------+---------+-----------------------------------------------------+

Examples
^^^^^^^^^

Get flights from 12pm to 1pm on Jan 29 2018:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/flights/all?begin=1517227200&end=1517230800" | python -m json.tool


.. _flights-aircraft:

Flights by Aircraft
--------------------------------------

This API call retrieves flights for a particular aircraft within a certain time interval.
Resulting flights departed and arrived within [begin, end].
If no flights are found for the given period, HTTP stats `404 - Not found` is returned with an
empty response body. 

.. note::  Flights are updated by a batch process at night, i.e., only flights from the previous day or earlier are available using this endpoint.

Operation
^^^^^^^^^

:code:`GET /flights/aircraft`

Request
^^^^^^^

These are the required request parameters:

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *icao24*       | string    | Unique ICAO 24-bit address of the transponder  |
|                |           | in hex string representation. All letters need |
|                |           | to be lower case                               |
+----------------+-----------+------------------------------------------------+
| *begin*        | integer   | Start of time interval to retrieve flights for |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+
| *end*          | integer   | End of time interval to retrieve flights for   |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+

The given time interval must not be larger than 2 days!

Response
^^^^^^^^

The response is a JSON array of flights where each flight is an object with the following properties:

+--------------------------------------------+---------+-----------------------------------------------------+
| Property                                   | Type    | Description                                         |
+============================================+=========+=====================================================+
| *icao24*                                   | string  | Unique ICAO 24-bit address of the transponder in    |
|                                            |         | hex string representation. All letters are lower    |
|                                            |         | case.                                               |
+--------------------------------------------+---------+-----------------------------------------------------+
| *firstSeen*                                | integer | Estimated time of departure for the flight as Unix  |
|                                            |         | time (seconds since epoch).                         |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirport*                      | string  | ICAO code of the estimated departure airport. Can   |
|                                            |         | be null if the airport could not be identified.     |
+--------------------------------------------+---------+-----------------------------------------------------+
| *lastSeen*                                 | integer | Estimated time of arrival for the flight as Unix    |
|                                            |         | time (seconds since epoch)                          |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirport*                        | string  | ICAO code of the estimated arrival airport. Can be  |
|                                            |         | null if the airport could not be identified.        |
+--------------------------------------------+---------+-----------------------------------------------------+
| *callsign*                                 | string  | Callsign of the vehicle (8 chars). Can be null if   |
|                                            |         | no callsign has been received. If the vehicle       |
|                                            |         | transmits multiple callsigns during the flight, we  |
|                                            |         | take the one seen most frequently                   |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportHorizDistance*         | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportVertDistance*          | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportHorizDistance*           | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportVertDistance*            | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *departureAirportCandidatesCount*          | integer | Number of other possible departure airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estDepartureAirport*.                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *arrivalAirportCandidatesCount*            | integer | Number of other possible arrival airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estArrivalAirport*.                                |
+--------------------------------------------+---------+-----------------------------------------------------+

Examples
^^^^^^^^^

Get flights for D-AIZZ (3c675a) on Jan 29 2018:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/flights/aircraft?icao24=3c675a&begin=1517184000&end=1517270400" | python -m json.tool


.. _flights-arrival:

Arrivals by Airport
--------------------------------------

Retrieve flights for a certain airport which arrived within a given time interval [begin, end].
If no flights are found for the given period, HTTP stats `404 - Not found` is returned with an
empty response body.

.. note::  Similar to flights, arrivals are updated by a batch process at night, i.e., only arrivals from the previous day or earlier are available using this endpoint.

Operation
^^^^^^^^^

:code:`GET /flights/arrival`

Request
^^^^^^^

These are the required request parameters:

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *airport*      | string    | ICAO identier for the airport                  |
+----------------+-----------+------------------------------------------------+
| *begin*        | integer   | Start of time interval to retrieve flights for |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+
| *end*          | integer   | End of time interval to retrieve flights for   |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+

The given time interval must not be larger than two days!


Response
^^^^^^^^

The response is a JSON array of flights where each flight is an object with the following properties:

+--------------------------------------------+---------+-----------------------------------------------------+
| Property                                   | Type    | Description                                         |
+============================================+=========+=====================================================+
| *icao24*                                   | string  | Unique ICAO 24-bit address of the transponder in    |
|                                            |         | hex string representation. All letters are lower    |
|                                            |         | case.                                               |
+--------------------------------------------+---------+-----------------------------------------------------+
| *firstSeen*                                | integer | Estimated time of departure for the flight as Unix  |
|                                            |         | time (seconds since epoch).                         |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirport*                      | string  | ICAO code of the estimated departure airport. Can   |
|                                            |         | be null if the airport could not be identified.     |
+--------------------------------------------+---------+-----------------------------------------------------+
| *lastSeen*                                 | integer | Estimated time of arrival for the flight as Unix    |
|                                            |         | time (seconds since epoch)                          |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirport*                        | string  | ICAO code of the estimated arrival airport. Can be  |
|                                            |         | null if the airport could not be identified.        |
+--------------------------------------------+---------+-----------------------------------------------------+
| *callsign*                                 | string  | Callsign of the vehicle (8 chars). Can be null if   |
|                                            |         | no callsign has been received. If the vehicle       |
|                                            |         | transmits multiple callsigns during the flight, we  |
|                                            |         | take the one seen most frequently                   |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportHorizDistance*         | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportVertDistance*          | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportHorizDistance*           | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportVertDistance*            | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *departureAirportCandidatesCount*          | integer | Number of other possible departure airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estDepartureAirport*.                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *arrivalAirportCandidatesCount*            | integer | Number of other possible arrival airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estArrivalAirport*.                                |
+--------------------------------------------+---------+-----------------------------------------------------+

Examples
^^^^^^^^^

Get all flights arriving at Frankfurt International Airport (EDDF) from 12pm to 1pm on Jan 29 2018:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/flights/arrival?airport=EDDF&begin=1517227200&end=1517230800" | python -m json.tool



.. _flights-departure:

Departures by Airport
--------------------------------------

Retrieve flights for a certain airport which departed within a given time interval [begin, end].
If no flights are found for the given period, HTTP stats `404 - Not found` is returned with an
empty response body.

Operation
^^^^^^^^^

:code:`GET /flights/departure`

Request
^^^^^^^

These are the required request parameters:

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *airport*      | string    | ICAO identier for the airport (usually upper   |
|                |           | case)                                          |
+----------------+-----------+------------------------------------------------+
| *begin*        | integer   | Start of time interval to retrieve flights for |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+
| *end*          | integer   | End of time interval to retrieve flights for   |
|                |           | as Unix time (seconds since epoch)             |
+----------------+-----------+------------------------------------------------+

The given time interval must cover more than two days (UTC)!

Response
^^^^^^^^

The response is a JSON array of flights where each flight is an object with the following properties

+--------------------------------------------+---------+-----------------------------------------------------+
| Property                                   | Type    | Description                                         |
+============================================+=========+=====================================================+
| *icao24*                                   | string  | Unique ICAO 24-bit address of the transponder in    |
|                                            |         | hex string representation. All letters are lower    |
|                                            |         | case.                                               |
+--------------------------------------------+---------+-----------------------------------------------------+
| *firstSeen*                                | integer | Estimated time of departure for the flight as Unix  |
|                                            |         | time (seconds since epoch).                         |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirport*                      | string  | ICAO code of the estimated departure airport. Can   |
|                                            |         | be null if the airport could not be identified.     |
+--------------------------------------------+---------+-----------------------------------------------------+
| *lastSeen*                                 | integer | Estimated time of arrival for the flight as Unix    |
|                                            |         | time (seconds since epoch)                          |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirport*                        | string  | ICAO code of the estimated arrival airport. Can be  |
|                                            |         | null if the airport could not be identified.        |
+--------------------------------------------+---------+-----------------------------------------------------+
| *callsign*                                 | string  | Callsign of the vehicle (8 chars). Can be null if   |
|                                            |         | no callsign has been received. If the vehicle       |
|                                            |         | transmits multiple callsigns during the flight, we  |
|                                            |         | take the one seen most frequently                   |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportHorizDistance*         | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportVertDistance*          | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportHorizDistance*           | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportVertDistance*            | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *departureAirportCandidatesCount*          | integer | Number of other possible departure airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estDepartureAirport*.                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *arrivalAirportCandidatesCount*            | integer | Number of other possible arrival airports. These    |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estArrivalAirport*.                                |
+--------------------------------------------+---------+-----------------------------------------------------+


Examples
^^^^^^^^^

Get all flights departing at Frankfurt International Airport (EDDF) from 12pm to 1pm on Jan 29 2018:

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/flights/departure?airport=EDDF&begin=1517227200&end=1517230800" | python -m json.tool


.. _tracks:

Track by Aircraft
------------------

.. note:: The tracks endpoint is purely **experimental**. You can use the flights endpoint for historical data: :ref:`flights-all`.

Retrieve the trajectory for a certain aircraft at a given time.  The trajectory
is a list of waypoints containing position, barometric altitude, true track and
an on-ground flag.

In contrast to state vectors, trajectories do not contain all information we
have about the flight, but rather show the aircraft's general movement
pattern.  For this reason, waypoints are selected among available state
vectors given the following set of rules:

- The first point is set immediately after the the aircraft's expected
  departure, or after the network received the first poisition when the
  aircraft entered its reception range.

- The last point is set right before the aircraft's expected arrival, or the
  aircraft left the networks reception range.

- There is a waypoint at least every 15 minutes when the aircraft is in-flight.

- A waypoint is added if the aircraft changes its track more than 2.5°.

- A waypoint is added if the aircraft changes altitude by more than 100m (~330ft).

- A waypoint is added if the on-ground state changes.

Tracks are strongly related to :ref:`flights <flights-all>`. Internally, we compute flights
and tracks within the same processing step. As such, it may be benificial to
retrieve a list of flights with the API methods from above, and use these results
with the given time stamps to retrieve detailed track information.


Operation
^^^^^^^^^

:code:`GET /tracks`

Request
^^^^^^^

+----------------+-----------+------------------------------------------------+
| Property       | Type      | Description                                    |
+================+===========+================================================+
| *icao24*       | string    | Unique ICAO 24-bit address of the transponder  |
|                |           | in hex string representation. All letters need |
|                |           | to be lower case                               |
+----------------+-----------+------------------------------------------------+
| *time*         | integer   | Unix time in seconds since epoch. It can be    |
|                |           | any time betwee start and end of a known       |
|                |           | flight. If time = 0, get the live track if     |
|                |           | there is any flight ongoing for the given      |
|                |           | aircraft.                                      |
+----------------+-----------+------------------------------------------------+


Response
^^^^^^^^

+--------------------------------------------+---------+-----------------------------------------------------+
| Property                                   | Type    | Description                                         |
+============================================+=========+=====================================================+
| *icao24*                                   | string  | Unique ICAO 24-bit address of the transponder in    |
|                                            |         | hex string representation. All letters are lower    |
|                                            |         | case.                                               |
+--------------------------------------------+---------+-----------------------------------------------------+
| *firstSeen*                                | integer | Estimated time of departure for the flight as Unix  |
|                                            |         | time (seconds since epoch).                         |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirport*                      | string  | ICAO code of the estimated departure airport. Can   |
|                                            |         | be null if the airport could not be identified.     |
+--------------------------------------------+---------+-----------------------------------------------------+
| *lastSeen*                                 | integer | Estimated time of arrival for the flight as Unix    |
|                                            |         | time (seconds since epoch)                          |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirport*                        | string  | ICAO code of the estimated arrival airport. Can be  |
|                                            |         | null if the airport could not be identified.        |
+--------------------------------------------+---------+-----------------------------------------------------+
| *callsign*                                 | string  | Callsign of the vehicle (8 chars). Can be null if   |
|                                            |         | no callsign has been received. If the vehicle       |
|                                            |         | transmits multiple callsigns during the flight, we  |
|                                            |         | take the one seen most frequently                   |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportHorizDistance*         | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estDepartureAirportVertDistance*          | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated departure airport in      |
|                                            |         | meters                                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportHorizDistance*           | integer | Horizontal distance of the last received airborne   |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *estArrivalAirportVertDistance*            | integer | Vertical distance of the last received airborne     |
|                                            |         | position to the estimated arrival airport in meters |
+--------------------------------------------+---------+-----------------------------------------------------+
| *departureAirportCandidatesCount*          | integer | Number of other possible departure airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estDepartureAirport*.                              |
+--------------------------------------------+---------+-----------------------------------------------------+
| *arrivalAirportCandidatesCount*            | integer | Number of other possible arrival airports. These  |
|                                            |         | are airports in short distance to                   |
|                                            |         | *estArrivalAirport*.                                |
+--------------------------------------------+---------+-----------------------------------------------------+


Limitations
^^^^^^^^^^^

It is not possible to access flight tracks from more than 30 days in the past.


Examples
^^^^^^^^^

Get the live track for aircraft with transponder address `3c4b26` (D-ABYF)

.. code-block:: bash

    $ curl -u "USERNAME:PASSWORD" -s "https://opensky-network.org/api/tracks/all?icao24=3c4b26&time=0"
