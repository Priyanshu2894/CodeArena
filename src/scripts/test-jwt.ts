
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const testJWT = async (): Promise<void> => {
  console.log("\n========== JWT UTILITY TESTS ==========\n");

  // TEST 1: Generate and verify access token
  console.log("TEST 1: Generate and verify access token");

  const accessToken = await generateAccessToken({
    id: "test-user-123",
    role: "USER",
  });

  const verifiedAccessToken = await verifyAccessToken(accessToken);

  console.log("Access token generated successfully");
  console.log("Verified access token:", verifiedAccessToken);
  console.log("TEST 1 PASSED\n");

  // TEST 2: Generate and verify refresh token
  console.log("TEST 2: Generate and verify refresh token");

  const refreshToken = await generateRefreshToken("test-user-123");

  const verifiedRefreshToken = await verifyRefreshToken(refreshToken.token);

  console.log("Refresh token generated successfully");
  console.log("Verified refresh token:", verifiedRefreshToken);
  console.log("TEST 2 PASSED\n");

  // TEST 3: Try using refresh token as access token
  console.log("TEST 3: Use refresh token as access token");

  try {
    await verifyAccessToken(refreshToken.token);

    console.log("TEST 3 FAILED: Refresh token was accepted as access token");
  } catch (error) {
    console.log("Refresh token correctly rejected as access token");

    if (error instanceof Error) {
      console.log("Reason:", error.message);
    }

    console.log("TEST 3 PASSED");
  }

  console.log("\n========== TESTS COMPLETED ==========\n");
};

testJWT().catch((error: unknown) => {
  console.error("JWT test execution failed:", error);
  process.exitCode = 1;
});
