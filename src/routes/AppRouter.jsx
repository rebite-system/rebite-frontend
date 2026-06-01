import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import SignIn from "../pages/SignIn/SignIn";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import SignUp from "../pages/SignUp/SignUp";

import ProtectedRoute from "../components/ProtectedRoute";

import RestaurantLayout from "../components/RestaurantLayout/RestaurantLayout";
import RestaurantHome from "../pages/Restaurant/RestaurantHome/RestaurantHome";
import AddListing from "../pages/Restaurant/AddListing/AddListing";
import Claims from "../pages/Restaurant/claims/claims";
import ManageListings from "../pages/Restaurant/ManageListings/ManageListings";
import Profile from "../pages/Restaurant/Profile/Profile";
import Notifications from "../pages/Restaurant/Notifications/Notifications";

import CharityLayout from "../components/CharityLayout/CharityLayout";
import CharityHome from "../pages/Charity/CharityHome/CharityHome";
import ClaimedListings from "../pages/Charity/ClaimedListings/ClaimedListings";
import CharityProfile from "../pages/Charity/CharityProfile/CharityProfile";

import DonorDashboard from "../pages/Donor/DonorDashboard/DonorDashboard";
import Donation from "../pages/Donor/Donation/Donation";
import DonorProfile from "../pages/Donor/DonorProfile/DonorProfile";

import AdminLayout from "../components/AdminLayout/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard/AdminDashboard";
import UsersManagement from "../pages/Admin/UsersManagement/UsersManagement";
import RegistrationRequests from "../pages/Admin/RegistrationRequests/RegistrationRequests";
import DonationsMonitoring from "../pages/Admin/DonationsMonitoring/DonationsMonitoring";
import FoodWasteMonitoring from "../pages/Admin/FoodWasteMonitoring/FoodWasteMonitoring";
import SystemSettings from "../pages/Admin/SystemSettings/SystemSettings";
import Reports from "../pages/Admin/Reports/Reports";

function AppRouter() {

    return (

        <Routes>

            <Route path="/" element={<Landing />} />

            <Route path="/signin" element={<SignIn />} />

            <Route path="/signup" element={<SignUp />} />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            {/* Restaurant Routes */}

            <Route
                path="/restaurant"
                element={
                    <ProtectedRoute allowedRoles={["restaurant"]}>
                        <RestaurantLayout>
                            <RestaurantHome />
                        </RestaurantLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/restaurant/add-listing"
                element={
                    <ProtectedRoute allowedRoles={["restaurant"]}>
                        <RestaurantLayout>
                            <AddListing />
                        </RestaurantLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/restaurant/manage-listings"
                element={
                    <ProtectedRoute allowedRoles={["restaurant"]}>
                        <RestaurantLayout>
                            <ManageListings />
                        </RestaurantLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/restaurant/notifications"
                element={
                    <ProtectedRoute allowedRoles={["restaurant"]}>
                        <RestaurantLayout>
                            <Notifications />
                        </RestaurantLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/restaurant/profile"
                element={
                    <ProtectedRoute allowedRoles={["restaurant"]}>
                        <RestaurantLayout>
                            <Profile />
                        </RestaurantLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/restaurant/claims"
                element={
                    <ProtectedRoute allowedRoles={["restaurant"]}>
                        <RestaurantLayout>
                            <Claims />
                        </RestaurantLayout>
                    </ProtectedRoute>
                }
            />

            {/* Charity Routes */}

            <Route
                path="/charity"
                element={
                    <ProtectedRoute allowedRoles={["charity"]}>
                        <CharityLayout>
                            <CharityHome />
                        </CharityLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/charity/claimed"
                element={
                    <ProtectedRoute allowedRoles={["charity"]}>
                        <CharityLayout>
                            <ClaimedListings />
                        </CharityLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/charity/profile"
                element={
                    <ProtectedRoute allowedRoles={["charity"]}>
                        <CharityLayout>
                            <CharityProfile />
                        </CharityLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/charity/notifications"
                element={
                    <ProtectedRoute allowedRoles={["charity"]}>
                        <CharityLayout>
                            <Notifications />
                        </CharityLayout>
                    </ProtectedRoute>
                }
            />

            {/* Donor Routes */}

            <Route
                path="/donor"
                element={
                    <ProtectedRoute allowedRoles={["donor"]}>
                        <DonorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/donation"
                element={
                    <ProtectedRoute allowedRoles={["donor"]}>
                        <Donation />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/donor/profile"
                element={
                    <ProtectedRoute allowedRoles={["donor"]}>
                        <DonorProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <UsersManagement />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/requests"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <RegistrationRequests />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/donations"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <DonationsMonitoring />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/food-waste"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <FoodWasteMonitoring />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/settings"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <SystemSettings />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout>
                            <Reports />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />


        </Routes>

    );
}

export default AppRouter;