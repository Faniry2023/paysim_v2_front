import { ConfidentialityModel } from "../models/confidentiality-model";
import { UserModel } from "../models/user-model";

export interface CompletUserHelper {
    userHelper: UserModel,
    confidentialityHelper: ConfidentialityModel
}
