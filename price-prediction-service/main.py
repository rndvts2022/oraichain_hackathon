import cv2
import pickle
from fastapi import Body,FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
import pandas as pd

from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from sklearn.preprocessing import MinMaxScaler


app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dataset_train_eth = pd.read_csv('ETH_USD_TRAIN.csv')
dataset_test_eth = pd.read_csv('ETH_USD_PREDICT.csv')

# Importing the training set
dataset_train = dataset_train_eth
training_set = dataset_train.iloc[:, 1:2].values

# Feature Scaling
sc = MinMaxScaler(feature_range = (0, 1))
training_set_scaled = sc.fit_transform(training_set)

# Creating a data structure with 60 timesteps and 1 output
X_train = []
y_train = []
for i in range(60, 1258):
    X_train.append(training_set_scaled[i-60:i, 0])
    y_train.append(training_set_scaled[i, 0])
X_train, y_train = np.array(X_train), np.array(y_train)

# Reshaping
X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))

# Initialising the RNN
regressor = Sequential()
regressor.add(LSTM(units = 50, return_sequences = True, input_shape = (X_train.shape[1], 1)))
regressor.add(Dropout(0.2))
regressor.add(LSTM(units = 50, return_sequences = True))
regressor.add(Dropout(0.2))
regressor.add(LSTM(units = 50, return_sequences = True))
regressor.add(Dropout(0.2))
regressor.add(LSTM(units = 50))
regressor.add(Dropout(0.2))

# Adding the output layer
regressor.add(Dense(units = 1))

# Compiling the RNN
regressor.compile(optimizer = 'adam', loss = 'mean_squared_error')
regressor.load_weights("regressor.h5")

dataset_test = dataset_test_eth

my_dataset_test = dataset_test

df_prices = dataset_train['Open'].values
df_timeline = dataset_train['Date'].values

# next 1 day
dataset_total = pd.concat((dataset_train['Open'], my_dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(my_dataset_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)
print("next 1 day")
print(my_dataset_test['Open'])
X_test = []
for i in range(60, 60+1):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
predicted_stock_price_1 = regressor.predict(X_test)
predicted_stock_price_1 = sc.inverse_transform(predicted_stock_price_1)
print(predicted_stock_price_1)

# next 2 day
my_dataset_test['Open'][0] = predicted_stock_price_1[0][0]
print("next 2 day")
print(my_dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], my_dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(my_dataset_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)

X_test = []
for i in range(60, 60+2):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
predicted_stock_price_2 = regressor.predict(X_test)
predicted_stock_price_2 = sc.inverse_transform(predicted_stock_price_2)

# next 3 day
my_dataset_test['Open'][1] = predicted_stock_price_2[1][0]
print("next 3 day")
print(my_dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], my_dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(my_dataset_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)

X_test = []
for i in range(60, 60+3):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
predicted_stock_price_3 = regressor.predict(X_test)
predicted_stock_price_3 = sc.inverse_transform(predicted_stock_price_3)
print(predicted_stock_price_3)

# next 4 day
my_dataset_test['Open'][2] = predicted_stock_price_3[2][0]
print("next 4 day")
print(my_dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], my_dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(my_dataset_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)

X_test = []
for i in range(60, 60+4):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
predicted_stock_price_4 = regressor.predict(X_test)
predicted_stock_price_4 = sc.inverse_transform(predicted_stock_price_4)
print(predicted_stock_price_4)

# next 5 day
my_dataset_test['Open'][3] = predicted_stock_price_4[3][0]
print("next 5 day")
print(my_dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], my_dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(my_dataset_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)

X_test = []
for i in range(60, 60+5):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
predicted_stock_price_5 = regressor.predict(X_test)
predicted_stock_price_5 = sc.inverse_transform(predicted_stock_price_5)
print(predicted_stock_price_5)

eth = {
    "prices": df_prices[len(df_prices)- 60:len(df_prices)].tolist(),
    "timeline": df_timeline[len(df_timeline)- 60:len(df_timeline)].tolist(),
    "prediction": {
        "predicted_price_1":str(predicted_stock_price_1[0][0]),
        "predicted_price_2":str(predicted_stock_price_2[1][0]),
        "predicted_price_3":str(predicted_stock_price_3[2][0]),
        "predicted_price_4":str(predicted_stock_price_4[3][0]),
        "predicted_price_5":str(predicted_stock_price_5[4][0])
    }
}


@app.post("/coin-predict/eth")
async def predict_part_class(payload: dict = Body(...)):
    try:
        symbol = payload['symbol']
        number_next_date = payload['number_next_date']

        # print(eth)

        # response = {
        #     "btc": btc
        # }

        print(btc)

        response = {
            "eth": eth,
            "btc": btc
        }
            
        return response
    except Exception as ex:
        print("An exception occurred: ",ex)
        return response, 200

# Read csv
dataset_train_btc = pd.read_csv('BTC_USD_TRAIN.csv')
dataset_test_btc = pd.read_csv('BTC_USD_PREDICT.csv')

# Importing the training set
dataset_train_btc = dataset_train_btc
training_set_btc = dataset_train_btc.iloc[:, 1:2].values

# Feature Scaling
sc_btc = MinMaxScaler(feature_range = (0, 1))
training_set_scaled_btc = sc_btc.fit_transform(training_set_btc)

# Creating a data structure with 60 timesteps and 1 output
X_train_btc = []
y_train_btc = []
for i in range(60, 1258):
    X_train_btc.append(training_set_scaled_btc[i-60:i, 0])
    y_train_btc.append(training_set_scaled_btc[i, 0])
X_train_btc, y_train_btc = np.array(X_train_btc), np.array(y_train_btc)

# Reshaping
X_train_btc = np.reshape(X_train_btc, (X_train_btc.shape[0], X_train_btc.shape[1], 1))

# Initialising the RNN
regressor_btc = Sequential()
regressor_btc.add(LSTM(units = 50, return_sequences = True, input_shape = (X_train_btc.shape[1], 1)))
regressor_btc.add(Dropout(0.2))
regressor_btc.add(LSTM(units = 50, return_sequences = True))
regressor_btc.add(Dropout(0.2))
regressor_btc.add(LSTM(units = 50, return_sequences = True))
regressor_btc.add(Dropout(0.2))
regressor_btc.add(LSTM(units = 50))
regressor_btc.add(Dropout(0.2))

# Adding the output layer
regressor_btc.add(Dense(units = 1))

# Compiling the RNN
regressor_btc.compile(optimizer = 'adam', loss = 'mean_squared_error')
regressor_btc.load_weights("regressor_btc.h5")

my_dataset_test_btc = dataset_test_btc

df_prices_btc = dataset_train_btc['Open'].values
df_timeline_btc = dataset_train_btc['Date'].values

# next 1 day
dataset_total_btc = pd.concat((dataset_train_btc['Open'], my_dataset_test_btc['Open']), axis = 0)
inputs_btc = dataset_total_btc[len(dataset_total_btc) - len(my_dataset_test_btc) - 60:].values
inputs_btc = inputs_btc.reshape(-1,1)
inputs_btc = sc_btc.transform(inputs_btc)
print("next 1 day")
print(my_dataset_test_btc['Open'])
X_test_btc = []
for i in range(60, 60+1):
    X_test_btc.append(inputs_btc[i-60:i, 0])
X_test_btc = np.array(X_test_btc)
X_test_btc = np.reshape(X_test_btc, (X_test_btc.shape[0], X_test_btc.shape[1], 1))
predicted_stock_price_1_btc = regressor_btc.predict(X_test_btc)
predicted_stock_price_1_btc = sc_btc.inverse_transform(predicted_stock_price_1_btc)
print(predicted_stock_price_1_btc)

# next 2 day
my_dataset_test_btc['Open'][0] = predicted_stock_price_1_btc[0][0]
print("next 2 day")
print(my_dataset_test_btc['Open'])
dataset_total_btc = pd.concat((dataset_train_btc['Open'], my_dataset_test_btc['Open']), axis = 0)
inputs_btc = dataset_total_btc[len(dataset_total_btc) - len(my_dataset_test_btc) - 60:].values
inputs_btc = inputs_btc.reshape(-1,1)
inputs_btc = sc_btc.transform(inputs_btc)

X_test_btc = []
for i in range(60, 60+2):
    X_test_btc.append(inputs_btc[i-60:i, 0])
X_test_btc = np.array(X_test_btc)
X_test_btc = np.reshape(X_test_btc, (X_test_btc.shape[0], X_test_btc.shape[1], 1))
predicted_stock_price_2_btc = regressor_btc.predict(X_test_btc)
predicted_stock_price_2_btc = sc_btc.inverse_transform(predicted_stock_price_2_btc)

# next 3 day
my_dataset_test_btc['Open'][1] = predicted_stock_price_2_btc[1][0]
print("next 3 day")
print(my_dataset_test_btc['Open'])
dataset_total_btc = pd.concat((dataset_train_btc['Open'], my_dataset_test_btc['Open']), axis = 0)
inputs_btc = dataset_total_btc[len(dataset_total_btc) - len(my_dataset_test_btc) - 60:].values
inputs_btc = inputs_btc.reshape(-1,1)
inputs_btc = sc_btc.transform(inputs_btc)

X_test_btc = []
for i in range(60, 60+3):
    X_test_btc.append(inputs_btc[i-60:i, 0])
X_test_btc = np.array(X_test_btc)
X_test_btc = np.reshape(X_test_btc, (X_test_btc.shape[0], X_test_btc.shape[1], 1))
predicted_stock_price_3_btc = regressor_btc.predict(X_test_btc)
predicted_stock_price_3_btc = sc_btc.inverse_transform(predicted_stock_price_3_btc)
print(predicted_stock_price_3_btc)

# next 4 day
my_dataset_test_btc['Open'][2] = predicted_stock_price_3_btc[2][0]
print("next 4 day")
print(my_dataset_test_btc['Open'])
dataset_total_btc = pd.concat((dataset_train_btc['Open'], my_dataset_test_btc['Open']), axis = 0)
inputs_btc = dataset_total_btc[len(dataset_total_btc) - len(my_dataset_test_btc) - 60:].values
inputs_btc = inputs_btc.reshape(-1,1)
inputs_btc = sc_btc.transform(inputs_btc)

X_test_btc = []
for i in range(60, 60+4):
    X_test_btc.append(inputs_btc[i-60:i, 0])
X_test_btc = np.array(X_test_btc)
X_test_btc = np.reshape(X_test_btc, (X_test_btc.shape[0], X_test_btc.shape[1], 1))
predicted_stock_price_4_btc = regressor_btc.predict(X_test_btc)
predicted_stock_price_4_btc = sc_btc.inverse_transform(predicted_stock_price_4_btc)
print(predicted_stock_price_4_btc)

# next 5 day
my_dataset_test_btc['Open'][3] = predicted_stock_price_4_btc[3][0]
print("next 5 day")
print(my_dataset_test_btc['Open'])
dataset_total_btc = pd.concat((dataset_train_btc['Open'], my_dataset_test_btc['Open']), axis = 0)
inputs_btc = dataset_total_btc[len(dataset_total_btc) - len(my_dataset_test_btc) - 60:].values
inputs_btc = inputs_btc.reshape(-1,1)
inputs_btc = sc_btc.transform(inputs_btc)

X_test_btc = []
for i in range(60, 60+5):
    X_test_btc.append(inputs_btc[i-60:i, 0])
X_test_btc = np.array(X_test_btc)
X_test_btc = np.reshape(X_test_btc, (X_test_btc.shape[0], X_test_btc.shape[1], 1))
predicted_stock_price_5_btc = regressor_btc.predict(X_test_btc)
predicted_stock_price_5_btc = sc_btc.inverse_transform(predicted_stock_price_5_btc)
print(predicted_stock_price_5_btc)

btc = {
    "prices": df_prices_btc[len(df_prices_btc)- 60:len(df_prices_btc)].tolist(),
    "timeline": df_timeline_btc[len(df_timeline_btc)- 60:len(df_timeline_btc)].tolist(),
    "prediction": {
        "predicted_price_1":str(predicted_stock_price_1_btc[0][0]),
        "predicted_price_2":str(predicted_stock_price_2_btc[1][0]),
        "predicted_price_3":str(predicted_stock_price_3_btc[2][0]),
        "predicted_price_4":str(predicted_stock_price_4_btc[3][0]),
        "predicted_price_5":str(predicted_stock_price_5_btc[4][0])
    }
}