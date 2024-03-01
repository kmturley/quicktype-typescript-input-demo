# quicktype-typescript-input-demo

Example quicktype project using TypeScript as input, built with:

* NodeJS 20.x
* TypeScript 5.x
* Quicktype 23.x


## Installation

Install dependencies using:

    npm install


## Usage

Run the dev version using:

    npm run dev

Create a build using:

    npm run build


## Example

Input:

```
export enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

Output json schema:
```
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "$ref": "#/definitions/Direction",
  "definitions": {
    "Direction": {
      "type": "string",
      "enum": [
        "DOWN",
        "LEFT",
        "RIGHT",
        "UP"
      ],
      "title": "Direction"
    }
  }
}
```

Output java:
```
package io.quicktype;

import java.io.IOException;

public enum Direction {
    DOWN, LEFT, RIGHT, UP;

    public String toValue() {
        switch (this) {
            case DOWN: return "DOWN";
            case LEFT: return "LEFT";
            case RIGHT: return "RIGHT";
            case UP: return "UP";
        }
        return null;
    }

    public static Direction forValue(String value) throws IOException {
        if (value.equals("DOWN")) return DOWN;
        if (value.equals("LEFT")) return LEFT;
        if (value.equals("RIGHT")) return RIGHT;
        if (value.equals("UP")) return UP;
        throw new IOException("Cannot deserialize Direction");
    }
}

```

## Contact

For more information please contact kmturley
