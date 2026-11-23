import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Location from "./pages/Location";
import Privacy from "./pages/Privacy";
import Notices from "./pages/Notices";
import Products from "./pages/Products";
import AdminLayout from "./components/AdminLayout";
import AdminNotices from "./components/AdminNotices";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminPortfolios from "./pages/AdminPortfolios";
import AdminProductEditor from "./pages/AdminProductEditor";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import Page from "./pages/Page";
import Portfolio from "./pages/Portfolio";
import Samples from "./pages/Samples";
import Card from "./pages/Card";
import Banner from "./pages/Banner";
import Leaflet from "./pages/Leaflet";
import Sticker from "./pages/Sticker";
import Envelope from "./pages/Envelope";
import Catalog from "./pages/Catalog";
import Paper_magnet from "./pages/Paper_magnet";
import Name_tag from "./pages/Name_tag";
import Promotional_item from "./pages/Promotional_item";
import Property from "./pages/Property";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/location" element={<Location />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/products" element={<Products />} />
          <Route path="/notice" element={<Notices />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminProductEditor />} />
            <Route path="products/edit/:id" element={<AdminProductEditor />} />
            <Route path="samples" element={<AdminProducts key="samples" sampleMode />} />
            <Route path="samples/add" element={<AdminProductEditor sampleMode />} />
            <Route path="samples/edit/:id" element={<AdminProductEditor sampleMode />} />
            <Route path="portfolios" element={<AdminPortfolios />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="notices" element={<AdminNotices />} />
          </Route>
          <Route path="/page" element={<Page />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/card/sample" element={<Samples title="명함" pagePath="/card/sample" />} />
          <Route path="/card/samples" element={<Samples title="명함" pagePath="/card/sample" />} />
          <Route path="/banner/samples" element={<Samples title="현수막" pagePath="/banner/samples" />} />
          <Route path="/leaflet/samples" element={<Samples title="전단/포스터" pagePath="/leaflet/samples" />} />
          <Route path="/sticker/samples" element={<Samples title="스티커" pagePath="/sticker/samples" />} />
          <Route path="/card" element={<Card />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/leaflet" element={<Leaflet />} />
          <Route path="/sticker" element={<Sticker />} />
          <Route path="/envelope" element={<Envelope />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/paper_magnet" element={<Paper_magnet />} />
          <Route path="/name_tag" element={<Name_tag />} />
          <Route path="/promotional_item" element={<Promotional_item />} />
          <Route path="/property" element={<Property />} />
        </Routes>
        <Footer />
      </div>
  );
}

export default App;
