import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  addNewAddress,
  updateAddress,
  getAddressById,
  clearCurrentAddress,
  getAllAddress,
  deleteAddress,
} from "./../../store/addressForm-slice/addressFormSlice";
import {
  fetchProvinces,
  fetchCities,
} from "../../store/locationSlice/locationSlice";
import {ImFileEmpty} from 'react-icons/im'

const Address = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

const {isAuthenticated} = useSelector((state) => state.auth)

  const [formShow, setFormShow] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const addressId = searchParams.get("id");
  const isEdit = Boolean(addressId);

  const {
    provinces,
    cities,
    isLoading: locationLoading,
    error: locationError,
  } = useSelector((state) => state.location);
  const {
    addresses,
    currentAddress,
    loading: addressLoading,
    error: addressError,
  } = useSelector((state) => state.address);


  useEffect(() => {
    dispatch(getAllAddress());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    namaPenerima: "",
    nomorTelepon: "",
    jalan: "",
    rtrw: "",
    kelurahan: "",
    kecamatan: "",
    provinsi: "",
    kota: "",
    postal_code: "",
  });

  useEffect(() => {
    dispatch(fetchProvinces())
      .unwrap()
      .catch((err) => {
        console.log(err.message || "Gagal mengambil provinsi");
      });

    if (isEdit) {
      if (isAuthenticated) {
        dispatch(getAddressById({ id: addressId }))
          .unwrap()
          .catch((err) => {
            console.log(err.message || "Gagal mengambil data alamat");
          });
      } else {
        navigate("/auth/login");
      }
    } else {
      dispatch(clearCurrentAddress());
    }

    return () => {
      dispatch(clearCurrentAddress());
    };
  }, [dispatch, isEdit, addressId, navigate, isAuthenticated]);

  useEffect(() => {
    if (isEdit && currentAddress) {
      setFormData({
        namaPenerima: currentAddress.namaPenerima || "",
        nomorTelepon: currentAddress.nomorTelepon || "",
        jalan: currentAddress.jalan || "",
        rtrw: currentAddress.rtrw || "",
        kelurahan: currentAddress.kelurahan || "",
        kecamatan: currentAddress.kecamatan || "",
        provinsi: currentAddress.provinsi.province_id || "",
        kota: currentAddress.kota.city_id || "",
        postal_code: currentAddress.kota.postal_code || "",
      });

      if (currentAddress.provinsi.province_id) {
        dispatch(fetchCities(currentAddress.provinsi.province_id))
          .unwrap()
          .catch((err) => {
            console.log(err.message || "Gagal mengambil kota");
          });
      }
    }
  }, [isEdit, currentAddress, dispatch]);

  const handleChange = (e) => {
    const { name, value, } = e.target;

    if (name === "provinsi") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        kota: "",
        postal_code: "",
      }));
      if (value) {
        dispatch(fetchCities(value))
          .unwrap()
          .catch((err) => {
            console.log(err.message || "Gagal mengambil kota");
          });
      }
    } else if (name === "kota") {
      const selectedCity = cities.find((city) => city.city_id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        postal_code: selectedCity ? selectedCity.postal_code : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "namaPenerima",
      "nomorTelepon",
      "jalan",
      "kelurahan",
      "kecamatan",
      "provinsi",
      "kota",
      "postal_code",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        console.log(`Field ${field} harus diisi`);
        return;
      }
    }

    const selectedCity = cities.find((c) => c.city_id === formData.kota);

    const payload = {
      namaPenerima: formData.namaPenerima,
      nomorTelepon: formData.nomorTelepon,
      jalan: formData.jalan,
      rtrw: formData.rtrw,
      kelurahan: formData.kelurahan,
      kecamatan: formData.kecamatan,
      provinsi: {
        province_id: formData.provinsi,
        province:
          provinces.find((p) => p.province_id === formData.provinsi)
            ?.province || "",
      },
      kota: {
        city_id: formData.kota,
        city_name: selectedCity?.city_name || "",
        type: selectedCity?.type || "",
        postal_code: formData.postal_code,
        province_id: selectedCity?.province_id || formData.provinsi,
      },
    };


      if (!isAuthenticated) {
        navigate("/auth/login");
      }

    try {
      if (isEdit) {
        await dispatch(
          updateAddress({ id: addressId, addressData: payload })
        ).unwrap();
        console.log("Alamat berhasil diupdate");
        navigate("/shop/my-address");
        setFormData({
          namaPenerima: "",
          nomorTelepon: "",
          jalan: "",
          rtrw: "",
          kelurahan: "",
          kecamatan: "",
          provinsi: "",
          kota: "",
          postal_code: "",
        });
        setFormShow(false);
      } else {
        await dispatch(addNewAddress({ addressData: payload })).unwrap();
        console.log("Alamat berhasil ditambahkan");
        setFormData({
          namaPenerima: "",
          nomorTelepon: "",
          jalan: "",
          rtrw: "",
          kelurahan: "",
          kecamatan: "",
          provinsi: "",
          kota: "",
          postal_code: "",
        });
        setFormShow(false);
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      try {
        await dispatch(deleteAddress({ id })).unwrap();
        console.log("Alamat berhasil dihapus");
      } catch (error) {
        console.log(error.message || "Gagal menghapus alamat");
      }
    }
  };

  return (
    <div className="w-full p-6 bg-white shadow-md">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold mb-2">Alamat yang Dimiliki:</h3>
          <button
            type="submit"
            className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none ${
              formShow ? "opacity-0 cursor-default" : ""
            }`}
            onClick={() => setFormShow(true)}
            disabled={formShow}
          >
            + Tambah Alamat
          </button>
        </div>
        {addresses && addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="border rounded-md p-4 shadow-sm"
              >
                <h4 className="font-semibold">
                  {address.namaPenerima} | {address.nomorTelepon}
                </h4>
                <p>
                  {address.jalan}, {address.rtrw && 'RT/RW'} {address.rtrw}, {address.kelurahan}, Kec.{" "}
                  {address.kecamatan}
                </p>
                <p className="mb-2">
                  {address.kota.type === "Kabupaten" ? "Kab." : "Kota"}{" "}
                  {address.kota.city_name}, {address.provinsi.province},{" "}
                  {address.kota.postal_code}
                </p>

                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setFormShow(true);
                      navigate(`/shop/my-address?id=${address._id}`);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center gap-2 border py-5 rounded-lg">
            <ImFileEmpty className="text-2xl" />
            <span>Anda belum menambahkan alamat</span>
          </div>
        )}
      </div>
      {formShow && (
        <div>
          <h2 className="text-2xl font-semibold my-4 pt-2 border-t">
            {isEdit ? "Edit Alamat" : "Tambah Alamat"}
          </h2>

          {addressError && <p className="text-red-500 mb-4">{addressError}</p>}

          {locationError && (
            <p className="text-red-500 mb-4">{locationError}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div className="mb-4">
                <label className="block text-gray-700">Nama Penerima</label>
                <input
                  type="text"
                  name="namaPenerima"
                  value={formData.namaPenerima}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Nomor Telepon</label>
                <input
                  type="text"
                  name="nomorTelepon"
                  value={formData.nomorTelepon}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Jalan</label>
                <input
                  type="text"
                  name="jalan"
                  value={formData.jalan}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">RT / RW</label>
                <input
                  type="text"
                  name="rtrw"
                  value={formData.rtrw}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Kelurahan</label>
                <input
                  type="text"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Kecamatan</label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Provinsi</label>
                <select
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((prov) => (
                    <option key={prov.province_id} value={prov.province_id}>
                      {prov.province}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700">Kota</label>
                <select
                  name="kota"
                  value={formData.kota}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.provinsi || locationLoading}
                >
                  <option value="">Pilih Kota</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.type === "Kabupaten" ? "Kab." : "Kota"}{" "}
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700">Kode Pos</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-5">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 focus:outline-none"
                onClick={() => {
                  setFormShow(false);
                  navigate("/shop/my-address");
                  setFormData({
                    namaPenerima: "",
                    nomorTelepon: "",
                    jalan: "",
                    rtrw: "",
                    kelurahan: "",
                    kecamatan: "",
                    provinsi: "",
                    kota: "",
                    postal_code: "",
                  });
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none ${
                  addressLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={addressLoading}
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Address;
