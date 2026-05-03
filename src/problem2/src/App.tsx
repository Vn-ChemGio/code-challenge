import {useEffect, useState} from 'react'
import {Controller, useForm} from "react-hook-form";
import Joi from "joi";
import {joiResolver} from "@hookform/resolvers/joi";
import {useAvailableCoins, useQuote} from "./hooks/useCoins.ts";
import AutocompleteInput from "./components/AutocompleteInput.tsx";


const schema = Joi.object<FormValues>({
  fromCoin: Joi.string().required().label("From Coin"),
  toCoin: Joi.string()
    .required()
    .invalid(Joi.ref("fromCoin"))
    .label("To Coin")
    .messages({
      "any.invalid": "From Coin and To Coin must be different",
    }),
  amount: Joi.number().positive().required().label("Amount"),
});

function App() {
  const {data: availableCoins, error, isLoading} = useAvailableCoins();
  const {getQuote, loading} = useQuote()
  const [exchangedAmount, setExchangedAmount] = useState<number>(0);
  
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormValues>({
    resolver: joiResolver(schema),
    defaultValues: {
      fromCoin: "",
      toCoin: "",
      amount: 1,
    },
  });
  
  useEffect(() => {
    if (!availableCoins || availableCoins?.length === 0) return;
    
    reset({
      fromCoin: availableCoins[0].currency,
      toCoin: availableCoins[1] ? availableCoins[1].currency : availableCoins[0].currency,
      amount: 1,
    });
  }, [isLoading, reset]);

  const onSubmit = async (values: FormValues) => {
    const value = await getQuote(values);
    setExchangedAmount(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load prices.
      </div>
    );
  }
  
  
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center">Crypto Exchange</h2>
        
        {/* From Coin */}
        <Controller
          name="fromCoin"
          control={control}
          render={({field}) => (
            <AutocompleteInput
              options={availableCoins?.map(value => value.currency)}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select coin"
            />
          )}
        />
        
        {/* To Coin */}
        <Controller
          name="toCoin"
          control={control}
          render={({field}) => (
            <AutocompleteInput
              options={availableCoins?.map(value => value.currency)}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select coin"
            />
          )}
        />
        
        {/* Amount */}
        <Controller
          name="amount"
          control={control}
          render={({field}) => (
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                {...field}
                type="number"
                placeholder="Enter amount"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
          )}
        />
        
        {/* Result */}
        <div>
          <label className="block text-sm font-medium mb-1">You Receive</label>
          <input
            readOnly
            value={loading ? "---->> Processing (delay 2s) --->>" : exchangedAmount ? exchangedAmount.toFixed(6) : "-"}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Exchange
        </button>
      </form>
    </div>
  );
}

export default App
