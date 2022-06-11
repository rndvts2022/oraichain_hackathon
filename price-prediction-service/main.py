import cv2
import pickle
from fastapi import Body,FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
# import matplotlib.pyplot as plt
import pandas as pd

from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout

print("oke")
app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importing the training set
dataset_train = pd.read_csv('ETH_USD_TRAIN.csv')
training_set = dataset_train.iloc[:, 1:2].values

# Feature Scaling
from sklearn.preprocessing import MinMaxScaler
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

dataset_test = pd.read_csv('ETH_USD_PREDICT.csv')

my_dataset_test = dataset_test

df_prices = dataset_train['Open'].values
# print(len(df_prices))
# print(df_prices[len(df_prices)- 60:len(df_prices)])

df_timeline = dataset_train['Date'].values
# print(len(df_timeline))
# print(df_timeline[len(df_timeline)- 60:len(df_timeline)])

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
print(predicted_stock_price_2)
print(predicted_stock_price_2[1])


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

@app.post("/coin-predict/eth")
async def predict_part_class(payload: dict = Body(...)):
    try:
        symbol = payload['symbol']
        number_next_date = payload['number_next_date']

        print("predicted_stock_price_5: ", predicted_stock_price_5)
        response = {
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
            
        return response
    except Exception as ex:
        print("An exception occurred: ",ex)
        return response, 200

# @app.post("/predict_leaf/predict_class")
# async def predict_part_class(file: UploadFile = File(...)):
#     try:
#         image = await get_image_file(file)
#         label,prob  = mobilenetv2_model.predict(image)
#         plant =  plant_info_by_id(label)
#         print(plant)
#         return plant
#     except:
#         print("An exception occurred")
#         return 'use POST!', 400