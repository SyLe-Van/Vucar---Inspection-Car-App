import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  carItems: [],
};
export const fetchInspectionByCarId = createAsyncThunk(
  "car/fetchInspectionByCarId",
  async (carId, thunkAPI) => {
    try {
      const response = await axios.get(`/api/v1/inspection?carId=${carId}`);
      return response.data.inspection;
    } catch (error) {
      console.error("Lỗi khi fetch inspection:", error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
export const carSlice = createSlice({
  name: "car",
  initialState,
  reducers: {
    setCars: (state, action) => {
      state.cars = action.payload;
    },
    clearInspection: (state) => {
      state.inspection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInspectionByCarId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInspectionByCarId.fulfilled, (state, action) => {
        state.loading = false;
        state.inspection = action.payload;
      })
      .addCase(fetchInspectionByCarId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { setCars, clearInspection } = carSlice.actions;
export default carSlice.reducer;
