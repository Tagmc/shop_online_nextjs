import { NextPage } from "next";
import { Box, Button, Checkbox, Container, CssBaseline, FormControlLabel, Grid, Typography, InputAdornment, IconButton, Icon, useTheme } from "@mui/material";
import { Controller, useForm } from 'react-hook-form';
import Link from "next/link";
import CustomTextField from "src/components/text-field";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { EMAIL_REG, PASSWORD_REG } from "src/configs/regex";
import { useState } from "react";
import Image from "next/image";
import IconifyIcon from "src/components/Icon";
import LoginDark from "/public/images/login-dark.png";
import LoginLight from "/public/images/login-light.png";
import GoogleSvg from "/public/svgs/facebook.svg";
import FacebookSvg from "/public/svgs/google.svg";
type TProps = {}

const LoginPage: NextPage<TProps> = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const theme = useTheme();

  const schema = yup
    .object().shape({
      email: yup.string().required("The field is required").matches(EMAIL_REG, "The field is must email type"),
      password: yup.string().required("The field is required").matches(PASSWORD_REG, "The password is contain character, special character, number"),
    })
  const { handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: "onBlur",
    resolver: yupResolver(schema)
  })
  const onSubmit = (data: { email: String, password: String }) => {

  }
  return (
    <Box
      display={{
        md: "flex",
        xs: "none",
        sm: "flex"
      }}
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        alignItems: "center",
        padding: "40px"
      }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px", backgroundColor: theme.palette.customColors.bodyBg, height: "100%", minWidth: "50vw" }}>
        <Image src={theme.palette.mode === 'light' ? LoginLight : LoginDark} alt="login image" style={{ height: "90%", width: "auto" }} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" noValidate>
            <Box sx={{ mt: 2, width: "300px" }}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextField
                    required
                    fullWidth
                    label="Email"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    placeholder="Input email"
                    error={Boolean(errors?.email)}
                    helperText={errors?.email?.message}
                  />
                )}
                name="email"
              />
            </Box>
            <Box sx={{ mt: 2, width: "300px" }}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextField
                    required
                    fullWidth
                    label="Password"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    type={showPassword ? "text" : "password"}
                    placeholder="Input password"
                    error={Boolean(errors?.password)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <IconifyIcon icon="material-symbols:visibility-outline" /> : <IconifyIcon icon="ic:outline-visibility-off" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    helperText={errors?.password?.message}
                  />
                )}
                name="password"
              />
            </Box>
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link href="#" >
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <Typography>
                {"Don't have an account?"}
              </Typography>
              <Link href="/register">
                {"Sign Up"}
              </Link>
            </Box>
            <Typography sx={{ textAlign: "center", mt: 2, mb: 2 }}>Or</Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <IconButton sx={{ color: "#497ce2" }}>
                <svg xmlns="http://www.w3.org/2000/svg"
                  role="img" font-size="1.375rem" className="iconify iconify--mdi" width="1em"
                  height="1em" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"></path>
                </svg>
              </IconButton>
              <IconButton sx={{ color: theme.palette.error.main }}>
                <svg xmlns="http://www.w3.org/2000/svg"
                  role="img" font-size="1.375rem" className="iconify iconify--mdi" width="1em"
                  height="1em" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"></path>
                </svg>
              </IconButton>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
export default LoginPage;