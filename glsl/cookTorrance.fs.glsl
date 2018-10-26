varying vec3 interpolatedNormal;
varying vec3 interpolatedPosition;

uniform vec3 lightColor;
uniform vec3 lightPosition;
unifrom vec3 ambientColor;
uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;
uniform float roughness;

void main() {

	vec3 ambient = ambientColor * vec3(kAmbient);
  vec3 N = normalize(interpolatedNormal);
	vec3 L = normalize(lightPosition - interpolatedPosition);
	vec3 diffuse = lightColor * vec3(kDiffuse) * vec3( max(dot(N, L), 0.0) );

	vec3 V = normalize(cameraPosition - interpolatedPosition);
  vec3 H = normalize((L + V) / vec3(2));

    // do the lighting calculation for each fragment.
    float NdotL = max(dot(N, L), 0.0);

		float specular = 0.0;
    if(NdotL > 0.0)
    {
        float NdotH = max(dot(N, H), 0.0);
        float NdotV = max(dot(N, V), 0.0);
        float VdotH = max(dot(V, H), 0.0);
        float HdotV = max(dot(H, V), 0.0);
        float LdotH = max(dot(L, H), 0.0);
        float mSquared = roughness * roughness;

        // geometric attenuation
        float NH2 = 2.0 * NdotH;
        float g1 = (NH2 * NdotV) / VdotH;
        float g2 = (NH2 * NdotL) / LdotH;
        float geoAtt = min(1.0, min(g1, g2));

        // roughness distribution function
        float r1 = 1.0 / ( PI * mSquared * pow(NdotH, 4.0));
        float r2 = (pow(NdotH, 2) - 1.0) / (mSquared * pow(NdotH, 2));
        float roughness = r1 * exp(r2);

        // fresnel
        // Schlick approximation
        float fresnel = pow(1.0 - HdotV, 5.0);
        fresnel *= (1.0 - shininess);
        fresnel += shininess;

        specular = (fresnel * geoAtt * roughness) / (PI * NdotL * NdotV);
    }

    vec3 finalValue =  NdotL * (kDiffuse + specular * (1.0 - kDiffuse)) + ambient;
    gl_FragColor = vec4(finalValue, 1.0);

}
