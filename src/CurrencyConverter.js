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
      symbolData: []
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
    this.props.onChange(e.target.value);
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
		const { currencies, selected, value, symbol, focus } = this.props;

		return(
      <div>
  			<fieldset>
  				<legend>{selected}</legend>
          <label>{symbol}</label>
  				<input
            type={'number'}
            step={100}
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
      symbolBase: '€',
      symbolToConvertTo: '$',
      defaultCurrencyBase: 'EUR',
      defaultCurrencyToConvertTo: 'USD',
      inputCurrency: '?',
      outputCurrency: '?',
      rate: 0,
      value: '0',
    }
    this.checkValidity = this.checkValidity.bind(this);
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

  checkValidity(value, rate) {
    const variable = parseFloat(value);
    const coefficient = parseFloat(rate);
    return this.multiply(variable, coefficient);
  }

  getSymbolBaseData(symbolData) {
      this.setState({ symbolBase: symbolData.symbol })
  }

  getSymbolToConvertToData(symbolData) {
      this.setState({ symbolToConvertTo: symbolData.symbol })
  }

  multiply(variable, coefficient) {
    return ( Math.round( (variable * coefficient) * 1000000 ) / 1000000 ).toFixed(2).toString();
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
    let newValue = value.toLocaleString("en-US"[this.state.defaultCurrencyBase]);

    this.setState({ value: newValue })
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

  render() {
    const { currencies, defaultCurrencyBase, defaultCurrencyToConvertTo, inputCurrency, rate, value, symbolBase, symbolToConvertTo } = this.state

    console.log(symbolBase)
    const newValue = value.replace(',', '.');

    const valueOne = defaultCurrencyBase === inputCurrency ? newValue : this.checkValidity(value, rate);
    const valueTwo = defaultCurrencyToConvertTo === inputCurrency ? newValue : this.checkValidity(value, rate);

    return (
      <div className='appContainer'>
         <Header headerText={'Currency Converter'}/>
         <CurrencyForm
  					position={1}
  					currencies={currencies}
  					selected={defaultCurrencyBase}
  					value={valueOne}
  					onClick={this.updateConversion}
  					onChange={this.updateValue}
  					onCurrencyChange={this.updateCurrency}
            getSymbolBaseData={this.getSymbolBaseData}
            symbol={symbolBase}
            focus={true}
            />

          <CurrencyForm
            position={2}
            currencies={currencies}
            selected={defaultCurrencyToConvertTo}
            value={valueTwo}
            onClick={this.updateConversion}
            onChange={this.updateValue}
            onCurrencyChange={this.updateCurrency}
            getSymbolToConvertToData={this.getSymbolToConvertToData}
            symbol={symbolToConvertTo}
            focus={false}
          />

          <section className='conversion-info'>
            <p>Exchange Rate: {rate}</p>
          </section>
      </div>
     )
  }
}
