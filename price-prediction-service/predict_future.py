
# Part 1 - Data Preprocessing

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout

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

# next 1 day
dataset_total = pd.concat((dataset_train['Open'], dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(dataset_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)
print("next 1 day")
print(dataset_test['Open'])
X_test = []
for i in range(60, 60+1):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
predicted_stock_price_1 = regressor.predict(X_test)
predicted_stock_price_1 = sc.inverse_transform(predicted_stock_price_1)
print(predicted_stock_price_1)


# next 2 day
dataset_test['Open'][0] = predicted_stock_price_1[0][0]
print("next 2 day")
print(dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(dataset_test) - 60:].values
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
dataset_test['Open'][1] = predicted_stock_price_2[1][0]
print("next 3 day")
print(dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(dataset_test) - 60:].values
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
dataset_test['Open'][2] = predicted_stock_price_3[2][0]
print("next 4 day")
print(dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(dataset_test) - 60:].values
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
dataset_test['Open'][3] = predicted_stock_price_4[3][0]
print("next 5 day")
print(dataset_test['Open'])
dataset_total = pd.concat((dataset_train['Open'], dataset_test['Open']), axis = 0)
inputs = dataset_total[len(dataset_total) - len(dataset_test) - 60:].values
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












# Visualising the results
# plt.plot(real_stock_price, color = 'red', label = 'Real ETH Price')
# plt.plot(predicted_stock_price, color = 'blue', label = 'Predicted ETH Price')
# plt.title('R&D - Viettel Solutions \n ETH Price Prediction')
# plt.xlabel('Time (01/05/2022 to 09/06/2022)')
# plt.ylabel('Price (USDT)')
# plt.legend()
# plt.show()
