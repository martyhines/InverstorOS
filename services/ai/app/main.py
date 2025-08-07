from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="InvestorOS AI Service", version="0.1.0")

# CORS for local/mobile/web dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UnderwriteRequest(BaseModel):
    purchase_price: float = Field(..., gt=0)
    rehab_cost: float = Field(0, ge=0)
    monthly_rent: float = Field(..., ge=0)
    annual_taxes: float = Field(0, ge=0)
    annual_insurance: float = Field(0, ge=0)
    monthly_hoa: float = Field(0, ge=0)
    vacancy_rate: float = Field(0.05, ge=0, le=1)
    maintenance_rate: float = Field(0.08, ge=0, le=1)
    management_rate: float = Field(0.08, ge=0, le=1)
    interest_rate: float = Field(0.065, ge=0)
    loan_term_years: int = Field(30, gt=0)
    down_payment_percent: float = Field(0.2, ge=0, le=1)


class UnderwriteResponse(BaseModel):
    loan_amount: float
    monthly_principal_and_interest: float
    monthly_taxes: float
    monthly_insurance: float
    monthly_operating_expenses: float
    monthly_noi: float
    monthly_piti: float
    annual_cash_flow: float
    cash_on_cash_roi: float


@app.get("/healthz")
async def health() -> dict:
    return {"status": "ok"}


def amortized_monthly_payment(loan_amount: float, annual_rate: float, term_years: int) -> float:
    r = annual_rate / 12.0
    n = term_years * 12
    if r == 0:
        return loan_amount / n
    return (r * loan_amount) / (1 - (1 + r) ** (-n))


@app.post("/ai/deals/underwrite", response_model=UnderwriteResponse)
async def underwrite(request: UnderwriteRequest) -> UnderwriteResponse:
    total_basis = request.purchase_price + request.rehab_cost
    down_payment = total_basis * request.down_payment_percent
    loan_amount = max(total_basis - down_payment, 0)

    monthly_pi = amortized_monthly_payment(loan_amount, request.interest_rate, request.loan_term_years)

    gross_rent = request.monthly_rent
    vacancy = gross_rent * request.vacancy_rate
    maintenance = gross_rent * request.maintenance_rate
    management = gross_rent * request.management_rate

    monthly_taxes = request.annual_taxes / 12.0
    monthly_insurance = request.annual_insurance / 12.0

    operating_expenses = vacancy + maintenance + management + monthly_taxes + monthly_insurance + request.monthly_hoa
    noi = gross_rent - vacancy - maintenance - management - monthly_taxes - monthly_insurance - request.monthly_hoa

    piti = monthly_pi + monthly_taxes + monthly_insurance + request.monthly_hoa
    annual_cash_flow = (noi - monthly_pi) * 12.0

    cash_invested = down_payment + request.rehab_cost
    cash_on_cash = (annual_cash_flow / cash_invested) if cash_invested > 0 else 0.0

    return UnderwriteResponse(
        loan_amount=round(loan_amount, 2),
        monthly_principal_and_interest=round(monthly_pi, 2),
        monthly_taxes=round(monthly_taxes, 2),
        monthly_insurance=round(monthly_insurance, 2),
        monthly_operating_expenses=round(operating_expenses, 2),
        monthly_noi=round(noi, 2),
        monthly_piti=round(piti, 2),
        annual_cash_flow=round(annual_cash_flow, 2),
        cash_on_cash_roi=round(cash_on_cash, 4),
    )


# Local dev entrypoint: `uvicorn app.main:app --reload --port 8000`
