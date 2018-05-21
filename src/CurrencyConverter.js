import React, { Component } from 'react';
import './CurrencyConverter.css'


const Header = (headerText) => {
	let pageTitle = headerText.headerText

return (
  	<div className='headerContainer'>
  	  <p className='title'>{pageTitle}</p>
  	</div>
  )
};

class CurrencyForm extends Component {
  constructor(props) {
    super(props);
		this.state = {
			symbolData: ''
		}
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
  }

	componentWillMount() {
    fetch('https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json')
      .then(currencyData => currencyData.json())
      .then(currencyData => {
        this.setState({ symbolData: currencyData })
      })
      .catch(err => console.log('Error in component will mount form', err))
  }

  handleClick(e) {
    this.props.onClick(this.props.selected, e.target.value);
  }

  handleChange(e) {
    this.props.onChange(e.target.value, this.props.position);
  }

  handleCurrencyChange(e) {
    let value = e.target.value
		let symbolData = this.state.symbolData[value];

    this.props.onCurrencyChange(value, this.props.position);

		if (this.props.getSymbolBaseData) {
      this.props.getSymbolBaseData(symbolData);
    }

    if (this.props.getSymbolToConvertToData) {
      this.props.getSymbolToConvertToData(symbolData);
    }
  }

  render() {
		const { currencies, selected, value, focus, symbol } = this.props;

		return(
      <div>
  			<fieldset>
  				<legend>{selected}</legend>
					<label>{symbol}</label>
  				<input
            min={0}
            autoFocus={focus}
            onFocus={this.value}
  					value={value}
  					onChange={this.handleChange}
  					onClick={this.handleClick} />
  				<select onChange={this.handleCurrencyChange}>
  					{
  						currencies.map(
  							currency => {
  								if(currency === selected) {
  									return(
  										<option key={currency} value={currency} selected>{currency}</option>
  									);
  								} else {
  									return(
  										<option key={currency} value={currency}>{currency}</option>
  									);
  								}
  							}
  						)
  					}
  				</select>
  			</fieldset>
      </div>
		);
  }
}

export default class CurrencyConverter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currencies: [],
      defaultCurrencyBase: 'EUR',
      defaultCurrencyToConvertTo: 'USD',
      inputCurrency: '?',
      outputCurrency: '?',
      rate: 0,
      value: 0,
			symbolBase: '€',
			symbolToConvertTo: '$'
    }
    this.beginConversion = this.beginConversion.bind(this);
		this.format = this.format.bind(this);
		this.getSymbolBaseData = this.getSymbolBaseData.bind(this);
		this.getSymbolToConvertToData = this.getSymbolToConvertToData.bind(this);
    this.multiply = this.multiply.bind(this);
    this.updateConversion = this.updateConversion.bind(this);
    this.updateCurrency = this.updateCurrency.bind(this);
    this.updateValue = this.updateValue.bind(this);
  }

  componentWillMount() {
    fetch('https://api.fixer.io/latest')
      .then(currencyData => currencyData.json())
      .then(currencyData => {
        const currencies = [];

        currencies.push(currencyData.base, ...Object.entries(currencyData.rates).map(rates => rates[0]));
        currencies.sort();
        this.setState({ currencies })
      })
      .catch(err => console.log('Error in component will mount', err))
  }

  beginConversion(value, rate) {
		let input = this.format(value.toString());

		const variable = parseFloat(input);
		const coefficient = parseFloat(rate);

		let convertedValue = parseFloat(this.multiply(variable, coefficient)).toFixed(2);

	  return convertedValue;
  }

	format(value) {
		let input = value.replace(/\D/g,'');
		let splitInput = input.split();
		let length = splitInput[0].length;

		let inputValueAsInt = parseFloat(input);

		console.log(input.length)
		if ((length === 0) && (inputValueAsInt < 100)) {
			input = value.replace(/\D/g,'');
		} else if ((length === 1) && (inputValueAsInt < 100)) {
			input = ('.0' + input).replace(/^0+/, '');
		} else if ((length === 3) && (inputValueAsInt < 100)) {
			input = (input.substring(0, 1) + '.' + input.substring(1, length)).replace(/^0+/, '');
		} else if ((length === 3) && (inputValueAsInt > 100)){
			input = (input.substring(0, length - 1) + '.' + input.substring(length - 1, length)).replace(/^0+/, '');
		} else if ((length > 3) && (inputValueAsInt > 100)){
			input = (input.substring(0, length - 2) + '.' + input.substring(length - 2, length)).replace(/^0+/, '');
		} else if ((length > 3) && (inputValueAsInt < 100)) {
			input = ('.0' + (input).replace(/^0+/, ''));
		}
		return input;
	}

	getSymbolBaseData(symbolData) {
		this.setState({ symbolBase: symbolData.symbol })
	}

	getSymbolToConvertToData(symbolData) {
		this.setState({ symbolToConvertTo: symbolData.symbol })
	}

  multiply(variable, coefficient) {
    return ( Math.round( (variable * coefficient) * 1000000 ) / 1000000 ).toString();
  }

  updateConversion(inputCurrency, value) {
    const { defaultCurrencyBase, defaultCurrencyToConvertTo } = this.state;

    const outputCurrency = inputCurrency === defaultCurrencyBase ? defaultCurrencyToConvertTo : defaultCurrencyBase;

    fetch(`https://api.fixer.io/latest?base=${inputCurrency}`)
    .then(data => data.json())
    .then(data => {
      let rate = data.rates[outputCurrency] || 1;
      this.setState({
        inputCurrency,
        outputCurrency,
        rate,
        value
      })
    })
    .catch(err => console.log('Error in updateConversion', err))
  }


  updateValue(value) {
		let input = this.format(value);

    this.setState({ value: input })
  }

  updateCurrency(currency, position) {
    this.setState({
      value: 0,
      rate: 0,
      inputCurrency: '',
      outputCurrency: ''
    })

    if (position === 1) {
      this.setState({ defaultCurrencyBase: currency })
    } else {
      this.setState({ defaultCurrencyToConvertTo: currency })
    }
  }

  render() {
    const { currencies, defaultCurrencyBase, defaultCurrencyToConvertTo, inputCurrency, rate, value, symbolBase, symbolToConvertTo } = this.state;
		const { getSymbolBaseData, getSymbolToConvertToData, updateConversion, updateCurrency, updateValue } = this;

	  const valueToConvertFrom = defaultCurrencyBase === inputCurrency ? value : this.beginConversion(value, rate);
    const valueToConvertTo = defaultCurrencyToConvertTo === inputCurrency ? value : this.beginConversion(value, rate);

    return (
      <div className='currencyConverterContainer'>
         <Header headerText={'Currency Converter'}/>
         <CurrencyForm
  					position={1}
  					currencies={currencies}
  					selected={defaultCurrencyBase}
  					value={valueToConvertFrom}
  					onClick={updateConversion}
  					onChange={updateValue}
  					onCurrencyChange={updateCurrency}
            focus={true}
						getSymbolBaseData={getSymbolBaseData}
						symbol={symbolBase}
					/>

          <CurrencyForm
            position={2}
            currencies={currencies}
            selected={defaultCurrencyToConvertTo}
            value={valueToConvertTo}
            onClick={updateConversion}
            onChange={updateValue}
            onCurrencyChange={updateCurrency}
            focus={false}
						getSymbolToConvertToData={getSymbolToConvertToData}
						symbol={symbolToConvertTo}
          />

        <section className='conversionInfo'>
          <p>Exchange Rate: {rate}</p>
        </section>
      </div>
     )
  }
}
