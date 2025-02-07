"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    return await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      })
      .then((res) => res.headers.get("location"));
  } catch (err: any) {
    // If it's a duplicate resource, return the existing funding source URL
    if (err.body?.code === 'DuplicateResource' && err.body?._links?.about?.href) {
      console.log('Using existing funding source:', err.body._links.about.href);
      return err.body._links.about.href;
    }
    console.error("Creating a Funding Source Failed: ", err);
    throw err;
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    return await dwollaClient
      .post("customers", newCustomer)
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Creating a Dwolla Customer Failed: ", err);
  }
};

export const getTransferStatus = async (transferUrl: string) => {
  try {
    const transfer = await dwollaClient.get(transferUrl);
    return transfer.body.status;
  } catch (err) {
    console.error("Failed to get transfer status:", err);
    throw err;
  }
};

export const getFundingSourceBalance = async (fundingSourceUrl: string) => {
  try {
    const response = await dwollaClient.get(`${fundingSourceUrl}/balance`);
    return response.body.balance;
  } catch (err) {
    console.error("Failed to get funding source balance:", err);
    throw err;
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    const transferUrl = await dwollaClient
      .post("transfers", requestBody)
      .then((res) => res.headers.get("location"));

    // Get initial transfer status and balance
    const status = await getTransferStatus(transferUrl!);
    console.log(`Transfer status: ${status}`);
    
    // Get updated balances
    const sourceBalance = await getFundingSourceBalance(sourceFundingSourceUrl);
    const destBalance = await getFundingSourceBalance(destinationFundingSourceUrl);
    
    console.log('Updated balances:', { sourceBalance, destBalance });

    return {
      transferUrl,
      status,
      sourceBalance,
      destBalance
    };
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};

