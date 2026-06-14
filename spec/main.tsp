import "@typespec/http";
import "@typespec/rest";
import "@typespec/versioning";

using TypeSpec.Http;
using TypeSpec.Versioning;

@versioned(Versions)
@service(#{title: "Project API"})
namespace ProjectApi;

enum Versions {
  v1: "1.0.0",
}

model HealthCheck {
  status: string;
}

@route("/health")
@get
op health(): HealthCheck;
