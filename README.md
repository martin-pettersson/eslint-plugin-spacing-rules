# Spacing Rules

Provides a set of augmented spacing rules.

## Rules

### array-bracket-spacing

Behaves exactly like `array-bracket-spacing` but adds an option to invert the
rule for destructuring assignments.

The following line is valid with the following configuration:

`const [ one, two, three ] = [1, 2, 3];`

```json
{
    "plugins": [
        "@martin-pettersson/spacing-rules"
    ],
    "rules": {
        "@martin-pettersson/spacing-rules/array-bracket-spacing": [
            "error",
            "never",
            {
                "destructuringAssignments": true
            }
        ]
    }
}
```

### object-curly-spacing

Behaves exactly like `object-curly-spacing` but adds an option to invert the
rule for destructuring assignments.

The following line is valid with the following configuration:

`const { one, two, three } = {one: 1, two: 2, three: 3};`

```json
{
    "plugins": [
        "@martin-pettersson/spacing-rules"
    ],
    "rules": {
        "@martin-pettersson/spacing-rules/object-curly-spacing": [
            "error",
            "never",
            {
                "destructuringAssignments": true
            }
        ]
    }
}
```
