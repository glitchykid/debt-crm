import Container from "@mui/material/Container";
import Debtors from "@/components/data_grid";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Debtors />
      </Container>
    </ThemeProvider>
  );
}
