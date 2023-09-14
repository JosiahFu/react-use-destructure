# `react-use-destructure`

React hook to split an object into multiple states.

Normally you should use multiple states for multiple values, but sometimes you
have, for example, a list of objects where a component must be rendered for
each object and the component has to modify its object. This hook lets you skip
the boilerplate when modifying properties of an object.

TypeScript is recommended for the level of complexity in this logic.

## Example Usage

```tsx
interface PersonData {
    name: string;
    age: number;
}

// Suppose you have a component Person which
// gets passed a PersonData and needs to modify it
function Person(props: {
    value: PersonData,
    onChange: (value: PersonData) => void
}) {
    const {
        name: [name, setName],
        age: [age, setAge]
    } = useDestructure(props.value, props.onChange);    
    
    // Now you can use these like regular states
    return <div>
        <h2>
            <input value={name} onChange={event => setName(event.target.value)} />
        </h2>
        <p>Age: {age}</p>
        <button onClick={() => setAge(age + 1)}>Increment Age</button>
    </div>
}
```

**Note:** If the object could gain properties (e.g. if some properties are
optional and get added later), you must specify *all* of the possible property
names as a third parameter, otherwise it will not expose these properties.

```ts
interface Shape {
    sides: number,
    curved?: boolean    
}

const [myShape, setMyShape] = useState<Shape>({sides: 4});

const {
    sides: [sides, setSides],
    curved: [curved, setCurved]
} = useDestructure(myShape, setMyShape, ['sides', 'curved']);
```

See also: [`@tater-archives/react-array-utils`](https://www.npmjs.com/package/@tater-archives/react-array-utils)
