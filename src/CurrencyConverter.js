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
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this)
  }

  handleClick(e) {
    this.props.onClick(this.props.selected, e.target.value);
  }

  handleChange(e) {
    this.props.onChange(e.target.value, this.props.position);
  }

  handleCurrencyChange(e) {
    let value = e.target.value

    this.props.onCurrencyChange(value, this.props.position);

  }

  render() {
		const { currencies, selected, value, focus } = this.props;

		return(
      <div>
  			<fieldset>
  				<legend>{selected}</legend>
  				<input
            type={'text'}
            min={0}
            autoFocus={focus}
            onFocus={() => this.value=';'}
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
    }
    this.checkValidity = this.checkValidity.bind(this);
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

  checkValidity(value, rate, position) {
    let newValue = value.toString().replace(/[^0-9.]/g, "");

    const variable = parseFloat(newValue);
    const coefficient = parseFloat(rate);
    let convertedValue = this.multiply(variable, coefficient);

    let formattedValue = '';
    if (position === 1) {
      formattedValue = (new Intl.NumberFormat('en-US', { style: 'currency', currency: this.state.defaultCurrencyBase }).format(convertedValue));
    } else {
      formattedValue = (new Intl.NumberFormat('en-US', { style: 'currency', currency: this.state.defaultCurrencyToConvertTo }).format(convertedValue));
    }

    return formattedValue
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


  updateValue(value, position) {
    let newValue = value.replace(/[^0-9.]/g, "");
    let floatValue = parseFloat(newValue);
    let formattedValue = '';

    if (position === 1) {
      formattedValue = (new Intl.NumberFormat('en-US', { style: 'currency', currency: this.state.defaultCurrencyBase }).format(floatValue));
    } else {
      formattedValue = (new Intl.NumberFormat('en-US', { style: 'currency', currency: this.state.defaultCurrencyToConvertTo }).format(floatValue));

    }

    this.setState({ value: formattedValue })
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
    const { currencies, defaultCurrencyBase, defaultCurrencyToConvertTo, inputCurrency, rate, value } = this.state

    const valueOne = defaultCurrencyBase === inputCurrency ? value : this.checkValidity(value, rate, 1);
    const valueTwo = defaultCurrencyToConvertTo === inputCurrency ? value : this.checkValidity(value, rate, 2);

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
          />

        <section className='conversionInfo'>
            <p>Exchange Rate: {rate}</p>
          </section>
      </div>
     )
  }
}
