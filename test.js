const rootDom = document.getElementById('root')
const RootContainer = ReactDOM.createRoot(rootDom)
RootContainer.render(React.createElement(App))




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
        'div',
        null,
        React.createElement('label', null, 'Controlled Input:'),
        React.createElement('input', {
            type: 'text',
            value: inputValue,
            onChange: handleChange
        }),
        isH1 ?
        React.createElement('h1', null, `Current Value: ${inputValue +'foobar'}`) :
        React.createElement('p', null, `Current Value: ${inputValue}`),
        React.createElement(
            'button', {
                onClick: toggleElement
            },
            'Toggle h1/p'
        )
    );
}