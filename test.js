const rootDom = document.getElementById('root')
const RootContainer = ReactDOM.createRoot(rootDom)
RootContainer.render(React.createElement(App))

function InputComponent({
    inputValue,
    handleChange
}) {
    return React.createElement(
        'div',
        null,
        React.createElement('label', null, 'Controlled Input:'),
        React.createElement('input', {
            type: 'text',
            value: inputValue,
            onChange: handleChange
        })
    );
}


function IndependentInputComponent() {
    const [localInputValue, setLocalInputValue] = React.useState('');
    const [dummyToggle, setDummyToggle] = React.useState('off')
    React.useEffect(() => {
        dummyToggle === 'off' ? setDummyToggle('on') : setDummyToggle('off')
    }, [localInputValue])

    const handleLocalChange = (event) => {
        setLocalInputValue(event.target.value);
    };

    return React.createElement('input', {
        type: 'text',
        value: localInputValue,
        onChange: handleLocalChange
    })
}


function ToggleButton({
    toggleElement
}) {
    return React.createElement(
        'button', {
            onClick: toggleElement
        },
        'Toggle h1/p'
    );
}


function App() {
    const [inputValue, setInputValue] = React.useState('');
    const [isH1, setIsH1] = React.useState(true);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const toggleElement = () => {
        setIsH1(!isH1);
    };

    return React.createElement(
        'section',
        null,
        React.createElement(InputComponent, {
            inputValue,
            handleChange
        }),
        isH1 ?
        React.createElement('h1', null, `Current Value: ${inputValue + ''}`) :
        React.createElement('p', null, `Current Value: ${inputValue}`),
        React.createElement(ToggleButton, {
            toggleElement
        }),

        React.createElement('hr'),
        React.createElement(IndependentInputComponent)

    );
}