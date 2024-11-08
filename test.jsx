

const rootDom = document.getElementById('root');
const RootContainer = ReactDOM.createRoot(rootDom);
RootContainer.render(<App key={'App'} />);

function InputComponent({ inputValue, handleChange }) {
    return (
        <div>
            <label>Controlled Input:</label>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
            />
        </div>
    );
}

function IndependentInputComponent() {
    const [localInputValue, setLocalInputValue] = React.useState('');
    const [dummyToggle, setDummyToggle] = React.useState('off');

    React.useEffect(() => {
        setDummyToggle(dummyToggle === 'off' ? 'on' : 'off');
    }, [localInputValue]);

    const handleLocalChange = (event) => {
        setLocalInputValue(event.target.value);
    };

    return (
        <>
            <input
                key={'input'}
                type="number"
                value={localInputValue}
                onChange={handleLocalChange}
            />
            <div key={'sibiling on input'}>sibiling on input</div>
        </>
    );
}

function ToggleButton() {
    const [isH1, setIsH1] = React.useState(true);

    const toggleElement = () => {
        setIsH1(!isH1);
    };

    return (<>
        <button key={'button'} onClick={toggleElement}>
            Toggle h1/p
        </button>
        {isH1 ? (
            <h1 key={'h1'}>dynamic tag</h1>
        ) : (
            <p key={'p'}>dynamic tag</p>
        )}
    </>
    );
}

function App() {

    return (
        <Main key={'Main'} />
    );
}


function Main() {
    const [inputValue, setInputValue] = React.useState('');
    console.log('re-render')

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };



    return (
        <section key={'section'}>
            {/* <InputComponent key={'InputComponent'} inputValue={inputValue} handleChange={handleChange} /> */}

            <ToggleButton key='ToggleButton' />
            <IndependentInputComponent key='IndependentInputComponent' />
        </section>
    );
}