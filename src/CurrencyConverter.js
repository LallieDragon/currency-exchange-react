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
			symbolOneData: ''
		}
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this)
  }

	componentWillMount() {
    fetch('https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json')
      .then(currencyData => currencyData.json())
      .then(currencyData => {
        this.setState({ symbolOneData: currencyData })
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
		let symbolData = this.state.symbolOneData[value];

    this.props.onCurrencyChange(value, this.props.position);

		if (this.props.getSymbolBaseData) {
      this.props.getSymbolBaseData(symbolData);
    }

    if (this.props.getSymbolToConvertToData) {
      this.props.getSymbolToConvertToData(symbolData)
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
			initialValue: '',
			symbolBase: '€',
			symbolToConvertTo: '$'
    }
    this.check = this.check.bind(this);
		this.format = this.format.bind(this);
		this.getSymbolBaseData = this.getSymbolBaseData.bind(this);
		this.getSymbolToConvertToData = this.getSymbolToConvertToData.bind(this);
    this.multiply = this.multiply.bind(this);
    this.updateConversion = this.updateConversion.bind(this);
    this.updateCurrency = this.updateCurrency.bind(this);
    this.updateValue = this.updateValue.bind(this);
		this.toFixed = this.toFixed.bind(this);
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

  check(value, rate) {
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

		let inputValue = parseFloat(input);

		if((length === 0) && (inputValue < 100)){
			input = value.replace(/\D/g,'');
		}else if((length === 1) && (inputValue < 100)){
			input = '.0' + input;
		}else if((length === 3) && (inputValue < 100)){
			console.log('input length 3 less than 100', typeof input, input.length, input)
			input = input.substring(0, 2) + '.' + input.substring(2, length);
		}else if((length === 3) && (inputValue > 100)){
			input = (input.substring(0, length - 1) + '.' + input.substring(length-1, length)).replace(/^0+/, '');
		}else if ((length > 3) && (inputValue > 100)){
			input = (input.substring(0, length - 2) + '.' + input.substring(length-2, length)).replace(/^0+/, '');
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
      value: '0',
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

	toFixed(value, precision) {
		var exponentialForm = this.unformat(value) + 'e' + precision;
		var rounded = Math.round(exponentialForm);
		var finalResult = Number(rounded + 'e-' + precision).toFixed(precision);
		return finalResult;
	}

  render() {
    const { currencies, defaultCurrencyBase, defaultCurrencyToConvertTo, inputCurrency, rate, value, symbolBase, symbolToConvertTo } = this.state

    const valueOne = defaultCurrencyBase === inputCurrency ? value : this.check(value, rate);
    const valueTwo = defaultCurrencyToConvertTo === inputCurrency ? value : this.check(value, rate);

    return (
      <div className='currencyConverterContainer'>
         <Header headerText={'Currency Converter'}/>
         <CurrencyForm
  					position={1}
  					currencies={currencies}
  					selected={defaultCurrencyBase}
  					value={valueOne}
  					onClick={this.updateConversion}
  					onChange={this.updateValue}
  					onCurrencyChange={this.updateCurrency}
            focus={true}
						getSymbolBaseData={this.getSymbolBaseData}
						symbol={symbolBase}
					/>

          <CurrencyForm
            position={2}
            currencies={currencies}
            selected={defaultCurrencyToConvertTo}
            value={valueTwo}
            onClick={this.updateConversion}
            onChange={this.updateValue}
            onCurrencyChange={this.updateCurrency}
            focus={false}
						getSymbolToConvertToData={this.getSymbolToConvertToData}
						symbol={symbolToConvertTo}
          />

        <section className='conversionInfo'>
          <p>Exchange Rate: {rate}</p>
        </section>
      </div>
     )
  }
}
